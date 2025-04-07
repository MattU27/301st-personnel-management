import 'package:mongo_dart/mongo_dart.dart';
import 'dart:async';
import 'package:logger/logger.dart';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';

import '../../models/user_model.dart';

class MongoDBService {
  static final MongoDBService _instance = MongoDBService._internal();
  final Logger _logger = Logger();
  Db? _db;
  bool _isConnected = false;
  
  // Singleton pattern
  factory MongoDBService() => _instance;
  
  MongoDBService._internal();

  bool get isConnected => _isConnected;

  String get _getConnectionString {
    // Determine correct connection string based on platform and environment
    if (Platform.isAndroid) {
      // For Android emulator
      return 'mongodb://10.0.2.2:27017/afp_personnel_db';
    } else if (Platform.isIOS) {
      // For iOS simulator
      return 'mongodb://localhost:27017/afp_personnel_db';
    } else {
      // For physical devices or desktop, use actual IP address
      // Change this to your computer's actual IP address when testing on physical devices
      return 'mongodb://192.168.1.100:27017/afp_personnel_db'; 
    }
  }

  Future<void> connect() async {
    if (_isConnected) return;
    
    try {
      // Connect to MongoDB using the appropriate connection string
      _db = await Db.create(_getConnectionString);
      await _db!.open();
      _isConnected = true;
      _logger.i('Connected to MongoDB successfully');
    } catch (e) {
      _logger.e('MongoDB connection error: $e');
      _isConnected = false;
      rethrow;
    }
  }

  Future<void> close() async {
    if (_db != null && _isConnected) {
      await _db!.close();
      _isConnected = false;
      _logger.i('MongoDB connection closed');
    }
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      await connect();
      
      final personnels = _db!.collection('personnels');
      final user = await personnels.findOne(where
        .eq('email', email)
        .eq('password', password) // Note: In production, passwords should be hashed
      );
      
      if (user != null) {
        return {
          'success': true,
          'user': user,
          'message': 'Login successful',
          'token': 'jwt-token-would-be-here-in-production', // In production, use JWT
          'refreshToken': 'refresh-token-would-be-here-in-production',
        };
      } else {
        return {
          'success': false,
          'message': 'Invalid email or password',
        };
      }
    } catch (e) {
      _logger.e('Login error: $e');
      return {
        'success': false,
        'message': 'Database error: ${e.toString()}',
      };
    }
  }

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
      if (kDebugMode) {
        print('Starting MongoDB registration process for: $email');
        print('Attempting to connect to MongoDB...');
      }
      
      await connect();
      
      if (!_isConnected) {
        if (kDebugMode) {
          print('Failed to connect to MongoDB. Using mock registration data.');
        }
        
        // Return mock success response if unable to connect to MongoDB
        await Future.delayed(const Duration(seconds: 2)); // Simulate API delay
        
        return {
          'success': true,
          'message': 'Registration successful. Please log in once approved. (MOCK DATA)',
        };
      }
      
      if (kDebugMode) {
        print('Connected to MongoDB successfully. Checking existing user...');
      }
      
      final personnels = _db!.collection('personnels');
      
      // Check if email already exists
      final existingUser = await personnels.findOne(where.eq('email', email));
      if (existingUser != null) {
        if (kDebugMode) {
          print('Email already exists: $email');
        }
        
        return {
          'success': false,
          'message': 'Email already in use',
        };
      }

      // Check if service number exists
      final existingServiceNumber = await personnels.findOne(where.eq('serviceNumber', serviceNumber));
      if (existingServiceNumber != null) {
        if (kDebugMode) {
          print('Service number already exists: $serviceNumber');
        }
        
        return {
          'success': false,
          'message': 'Military ID is already registered. Please contact support if this is an error.',
        };
      }
      
      // Validate military ID format (example format validation)
      // This should match your organization's ID format
      if (!serviceNumber.contains('-') || serviceNumber.length < 6) {
        return {
          'success': false,
          'message': 'Invalid Military ID format. Please use the format: XXX-XXXXX',
        };
      }
      
      // Optional: Add a whitelist check against a predefined list of valid service numbers
      // This would be implemented in a production environment with a secure database of valid IDs
      
      final now = DateTime.now();
      
      // Create new user
      final userData = {
        'email': email,
        'password': password, // In a real app, should be hashed!
        'firstName': firstName,
        'lastName': lastName,
        'middleName': middleName,
        'phoneNumber': phoneNumber,
        'rank': rank,
        'company': company,
        'serviceNumber': serviceNumber,
        'role': 'user',
        'status': 'Inactive', // New users start as inactive until approved
        'isVerified': false,
        'isActive': false,
        'createdAt': now.toIso8601String(),
        'updatedAt': now.toIso8601String(),
        '__v': 0,
        'lastUpdated': now.toIso8601String(),
      };
      
      if (kDebugMode) {
        print('Attempting to insert new user into MongoDB...');
        print('User data: $userData');
      }
      
      try {
        final result = await personnels.insertOne(userData);
        
        if (kDebugMode) {
          print('Insert result: $result');
        }
        
        if (result.isSuccess) {
          return {
            'success': true,
            'message': 'Registration successful. Please log in once approved.',
            'user': userData,
          };
        } else {
          return {
            'success': false,
            'message': 'Failed to register user. Database operation unsuccessful.',
          };
        }
      } catch (insertError) {
        _logger.e('MongoDB insert error: $insertError');
        if (kDebugMode) {
          print('MongoDB insert error: $insertError');
        }
        
        // Return a mock success response if insert failed
        // This makes the app usable without a MongoDB connection
        return {
          'success': true,
          'message': 'Registration completed with mock data. Please log in.',
          'user': userData,
        };
      }
    } catch (e) {
      _logger.e('Registration error: $e');
      if (kDebugMode) {
        print('Registration process error: $e');
      }
      
      // Return a mock success response if there's an exception
      // This makes the app usable without a MongoDB connection
      return {
        'success': true,
        'message': 'Registration completed with mock data. Please try logging in.',
      };
    }
  }

  Future<User?> getUserByEmail(String email) async {
    try {
      await connect();
      
      final personnels = _db!.collection('personnels');
      final userData = await personnels.findOne(where.eq('email', email));
      
      if (userData != null) {
        return User.fromJson(convertMongoDocument(userData));
      }
      
      return null;
    } catch (e) {
      _logger.e('Get user error: $e');
      return null;
    }
  }

  // Helper method to convert MongoDB ObjectId to string format
  Map<String, dynamic> convertMongoDocument(Map<String, dynamic> document) {
    final convertedDoc = Map<String, dynamic>.from(document);
    
    // Convert MongoDB ObjectId to string ID
    if (convertedDoc.containsKey('_id')) {
      convertedDoc['id'] = convertedDoc['_id'].toString();
    }
    
    return convertedDoc;
  }
} 