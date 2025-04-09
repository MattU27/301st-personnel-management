import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/app_constants.dart';
import '../core/services/auth_service.dart';
import '../models/user_model.dart';
import './login_screen.dart';
import './home_screen.dart';
import './trainings_screen.dart';
import './documents_screen.dart';
import './profile_screen.dart';

class DashboardScreen extends StatefulWidget {
  final int? initialTabIndex;
  final Map<String, dynamic>? params;
  
  const DashboardScreen({
    Key? key, 
    this.initialTabIndex,
    this.params,
  }) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;
  bool _isLoading = true;
  User? _user;
  Map<String, dynamic>? _params;

  @override
  void initState() {
    super.initState();
    // Set initial tab index if provided
    if (widget.initialTabIndex != null) {
      _currentIndex = widget.initialTabIndex!;
    }
    // Store params for passing to child screens
    _params = widget.params;
    _loadUserData();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    
    // Check for navigation arguments
    final args = ModalRoute.of(context)?.settings.arguments;
    print('Dashboard received args: $args');
    
    if (args != null && args is Map<String, dynamic>) {
      if (args.containsKey('initialTabIndex')) {
        final newIndex = args['initialTabIndex'] as int;
        print('Setting current index from $_currentIndex to $newIndex');
        
        // Only update state if the index has changed
        if (_currentIndex != newIndex) {
          setState(() {
            _currentIndex = newIndex;
          });
        }
      }
      
      if (args.containsKey('params')) {
        _params = args['params'];
        print('Received params: $_params');
      }
    }
  }

  Future<void> _loadUserData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final authService = AuthService();
      final user = await authService.getCurrentUser();

      if (user == null) {
        if (context.mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const LoginScreen()),
          );
        }
        return;
      }

      setState(() {
        _user = user;
      });
    } catch (e) {
      // Handle error
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _logout() async {
    // First check if we need to show the confirmation
    if (!context.mounted) return;
    
    final shouldLogout = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(
              'Logout',
              style: TextStyle(color: AppTheme.errorColor),
            ),
          ),
        ],
      ),
    );

    if (shouldLogout != true) return;
    
    // Show loading indicator
    if (context.mounted) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext context) {
          return const AlertDialog(
            content: Row(
              children: [
                CircularProgressIndicator(),
                SizedBox(width: 16),
                Text("Logging out..."),
              ],
            ),
          );
        },
      );
    }

    try {
      final authService = AuthService();
      await authService.logout();

      // Close the loading dialog and navigate to login
      if (context.mounted) {
        Navigator.of(context).pop(); // Remove loading dialog
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) => const LoginScreen()),
          (route) => false,
        );
      }
    } catch (e) {
      // Close the loading dialog and show error
      if (context.mounted) {
        Navigator.of(context).pop(); // Remove loading dialog
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Logout failed: ${e.toString()}'),
            backgroundColor: AppTheme.errorColor,
          ),
        );
      }
    }
  }

  Widget _buildScreen() {
    switch (_currentIndex) {
      case 0:
        return HomeScreen(user: _user);
      case 1:
        // Pass target ID to TrainingsScreen if available
        return const TrainingsScreen();
        // TODO: Update TrainingsScreen to support targeting specific training by ID
        // return TrainingsScreen(initialId: _params != null ? _params!['targetId'] : null);
      case 2:
        // Pass target ID to DocumentsScreen if available
        return const DocumentsScreen();
        // TODO: Update DocumentsScreen to support targeting specific document by ID
        // return DocumentsScreen(initialId: _params != null ? _params!['targetId'] : null);
      case 3:
        return ProfileScreen(user: _user, onLogout: _logout);
      default:
        return HomeScreen(user: _user);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    return Scaffold(
      body: _buildScreen(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        selectedItemColor: AppTheme.primaryColor,
        unselectedItemColor: AppTheme.textSecondaryColor,
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.military_tech),
            label: 'Trainings',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.description),
            label: 'Documents',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
} 