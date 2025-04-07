import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:logger/logger.dart';

import '../constants/app_constants.dart';
import '../../models/user_model.dart';
import './mongodb_service.dart';

class AuthService extends ChangeNotifier {
  final Dio _dio = Dio(BaseOptions(
    connectTimeout: Duration(milliseconds: AppConstants.connectionTimeout),
    receiveTimeout: Duration(milliseconds: AppConstants.receiveTimeout),
    validateStatus: (status) => status! < 500,
  ));
  
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();
  final Logger _logger = Logger();
  final MongoDBService _mongoDBService = MongoDBService();
  
  User? _currentUser;
  bool _isInitialized = false;
  bool _useLocalMongoDB = true; // Set to true to use direct MongoDB connection
  
  User? get currentUser => _currentUser;
  bool get isInitialized => _isInitialized;
  
  // Initialize the service
  Future<void> init() async {
    if (_isInitialized) return;
    
    try {
      // Check if there's a stored token and user data
      await isLoggedIn();
      _currentUser = await getCurrentUser();
      _isInitialized = true;
    } catch (e) {
      _logger.e('Failed to initialize auth service: $e');
    }
  }

  // Login with email and password
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      if (kDebugMode) {
        print('Starting login process for: $email');
      }

      if (_useLocalMongoDB) {
        try {
          if (kDebugMode) {
            print('Attempting to connect to MongoDB...');
          }
          
          // Use direct MongoDB connection
          final result = await _mongoDBService.login(email, password);
          
          if (kDebugMode) {
            print('MongoDB login result: $result');
          }
          
          if (result['success']) {
            // Store tokens securely (dummy tokens in this case)
            await _secureStorage.write(key: AppConstants.tokenKey, value: result['token']);
            await _secureStorage.write(key: AppConstants.refreshTokenKey, value: result['refreshToken']);
            
            // Store user data
            final user = User.fromJson(_mongoDBService.convertMongoDocument(result['user']));
            _currentUser = user;
            await _secureStorage.write(key: AppConstants.userDataKey, value: jsonEncode(user.toJson()));
            await _secureStorage.write(key: AppConstants.userRoleKey, value: user.role);
            
            notifyListeners();
          }
          
          return result;
        } catch (mongoError) {
          _logger.e('MongoDB login error: $mongoError');
          if (kDebugMode) {
            print('MongoDB connection error: $mongoError');
            print('Using mock login data instead');
          }
          
          // If MongoDB connection fails, use mock data for testing
          await Future.delayed(const Duration(seconds: 1)); // Simulate API delay
          
          if (email == 'test@example.com' && password == 'password') {
            // Create mock user data
            final mockUser = {
              '_id': 'mock_id_${DateTime.now().millisecondsSinceEpoch}',
              'email': email,
              'firstName': 'Test',
              'lastName': 'User',
              'role': 'user',
              'status': 'Active',
              'isActive': true,
              'isVerified': true,
              'createdAt': DateTime.now().toIso8601String(),
            };
            
            // Store mock tokens
            await _secureStorage.write(key: AppConstants.tokenKey, value: 'mock_token');
            await _secureStorage.write(key: AppConstants.refreshTokenKey, value: 'mock_refresh_token');
            
            // Store mock user
            final user = User.fromJson(mockUser);
            _currentUser = user;
            await _secureStorage.write(key: AppConstants.userDataKey, value: jsonEncode(user.toJson()));
            await _secureStorage.write(key: AppConstants.userRoleKey, value: user.role);
            
            notifyListeners();
            
            return {
              'success': true,
              'user': mockUser,
              'message': 'Login successful (MOCK DATA)',
              'token': 'mock_token',
              'refreshToken': 'mock_refresh_token',
            };
          }
          
          return {
            'success': false,
            'message': 'Invalid email or password. Try test@example.com with password "password" for demo.',
          };
        }
      } else {
        // Use API
        final response = await _dio.post(
          AppConstants.loginEndpoint,
          data: {
            'email': email,
            'password': password,
          },
        );

        if (response.statusCode == 200) {
          final data = response.data;
          
          // Store tokens securely
          await _secureStorage.write(key: AppConstants.tokenKey, value: data['token']);
          await _secureStorage.write(key: AppConstants.refreshTokenKey, value: data['refreshToken']);
          
          // Store user data
          final user = User.fromJson(data['user']);
          _currentUser = user;
          await _secureStorage.write(key: AppConstants.userDataKey, value: jsonEncode(user.toJson()));
          await _secureStorage.write(key: AppConstants.userRoleKey, value: user.role);
          
          notifyListeners();
          
          return {
            'success': true,
            'user': user,
            'message': 'Login successful',
          };
        } else {
          _logger.e('Login error: ${response.statusCode} - ${response.data['message']}');
          return {
            'success': false,
            'message': response.data['message'] ?? 'Login failed',
          };
        }
      }
    } catch (e) {
      _logger.e('Login exception: $e');
      if (kDebugMode) {
        print('Login exception: $e');
      }
      return {
        'success': false,
        'message': 'Network or server error. Please try again.',
      };
    }
  }

  // Register new user
  Future<Map<String, dynamic>> register({
    required String email, 
    required String password, 
    required String firstName, 
    required String lastName,
    String? middleName,
    String? phoneNumber,
    String? rank,
    String? company,
    required String serviceNumber,
  }) async {
    try {
      if (_useLocalMongoDB) {
        // Use direct MongoDB connection
        return await _mongoDBService.register(
          email: email,
          password: password,
          firstName: firstName,
          lastName: lastName,
          middleName: middleName,
          phoneNumber: phoneNumber,
          rank: rank,
          company: company,
          serviceNumber: serviceNumber,
        );
      } else {
        // Use API
        final response = await _dio.post(
          AppConstants.registerEndpoint,
          data: {
            'email': email,
            'password': password,
            'firstName': firstName,
            'lastName': lastName,
            'middleName': middleName,
            'phoneNumber': phoneNumber,
            'rank': rank,
            'company': company,
            'serviceNumber': serviceNumber,
            'role': 'reservist', // Default role for mobile app users
          },
        );

        if (response.statusCode == 201) {
          return {
            'success': true,
            'message': 'Registration successful. Please log in.',
          };
        } else {
          _logger.e('Registration error: ${response.statusCode} - ${response.data['message']}');
          return {
            'success': false,
            'message': response.data['message'] ?? 'Registration failed',
          };
        }
      }
    } catch (e) {
      _logger.e('Registration exception: $e');
      return {
        'success': false,
        'message': 'Network or server error. Please try again.',
      };
    }
  }

  // Logout user
  Future<void> logout() async {
    try {
      await _secureStorage.delete(key: AppConstants.tokenKey);
      await _secureStorage.delete(key: AppConstants.refreshTokenKey);
      await _secureStorage.delete(key: AppConstants.userDataKey);
      await _secureStorage.delete(key: AppConstants.userRoleKey);
      _currentUser = null;
      notifyListeners();
    } catch (e) {
      _logger.e('Logout exception: $e');
    }
  }

  // Check if user is logged in
  Future<bool> isLoggedIn() async {
    try {
      final token = await _secureStorage.read(key: AppConstants.tokenKey);
      if (token == null) return false;
      
      // Check if token is expired
      final isExpired = JwtDecoder.isExpired(token);
      if (isExpired) {
        // Try to refresh the token
        final refreshed = await refreshToken();
        return refreshed;
      }
      
      return true;
    } catch (e) {
      _logger.e('Check login status exception: $e');
      return false;
    }
  }

  // Refresh token
  Future<bool> refreshToken() async {
    try {
      final refreshToken = await _secureStorage.read(key: AppConstants.refreshTokenKey);
      if (refreshToken == null) return false;
      
      final response = await _dio.post(
        AppConstants.refreshTokenEndpoint,
        data: {
          'refreshToken': refreshToken,
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        await _secureStorage.write(key: AppConstants.tokenKey, value: data['token']);
        await _secureStorage.write(key: AppConstants.refreshTokenKey, value: data['refreshToken']);
        return true;
      } else {
        // If refresh fails, logout the user
        await logout();
        return false;
      }
    } catch (e) {
      _logger.e('Refresh token exception: $e');
      await logout();
      return false;
    }
  }

  // Get current user
  Future<User?> getCurrentUser() async {
    try {
      final userData = await _secureStorage.read(key: AppConstants.userDataKey);
      if (userData == null) return null;
      
      return User.fromJson(jsonDecode(userData));
    } catch (e) {
      _logger.e('Get current user exception: $e');
      return null;
    }
  }

  // Update user profile
  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> userData) async {
    try {
      final token = await _secureStorage.read(key: AppConstants.tokenKey);
      if (token == null) {
        return {
          'success': false,
          'message': 'Not authenticated',
        };
      }
      
      final response = await _dio.put(
        AppConstants.updateProfileEndpoint,
        options: Options(headers: {'Authorization': 'Bearer $token'}),
        data: userData,
      );

      if (response.statusCode == 200) {
        final updatedUser = User.fromJson(response.data['user']);
        await _secureStorage.write(
          key: AppConstants.userDataKey, 
          value: jsonEncode(updatedUser.toJson())
        );
        
        return {
          'success': true,
          'user': updatedUser,
          'message': 'Profile updated successfully',
        };
      } else {
        return {
          'success': false,
          'message': response.data['message'] ?? 'Failed to update profile',
        };
      }
    } catch (e) {
      _logger.e('Update profile exception: $e');
      return {
        'success': false,
        'message': 'Network or server error. Please try again.',
      };
    }
  }

  // Change password
  Future<Map<String, dynamic>> changePassword(String currentPassword, String newPassword) async {
    try {
      final token = await _secureStorage.read(key: AppConstants.tokenKey);
      if (token == null) {
        return {
          'success': false,
          'message': 'Not authenticated',
        };
      }
      
      final response = await _dio.post(
        AppConstants.changePasswordEndpoint,
        options: Options(headers: {'Authorization': 'Bearer $token'}),
        data: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );

      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': 'Password changed successfully',
        };
      } else {
        return {
          'success': false,
          'message': response.data['message'] ?? 'Failed to change password',
        };
      }
    } catch (e) {
      _logger.e('Change password exception: $e');
      return {
        'success': false,
        'message': 'Network or server error. Please try again.',
      };
    }
  }

  // Request password reset
  Future<Map<String, dynamic>> forgotPassword(String email) async {
    try {
      final response = await _dio.post(
        AppConstants.forgotPasswordEndpoint,
        data: {
          'email': email,
        },
      );

      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': 'Password reset instructions sent to your email',
        };
      } else {
        return {
          'success': false,
          'message': response.data['message'] ?? 'Failed to send reset instructions',
        };
      }
    } catch (e) {
      _logger.e('Forgot password exception: $e');
      return {
        'success': false,
        'message': 'Network or server error. Please try again.',
      };
    }
  }

  // Get authentication token
  Future<String?> getToken() async {
    return await _secureStorage.read(key: AppConstants.tokenKey);
  }
} 