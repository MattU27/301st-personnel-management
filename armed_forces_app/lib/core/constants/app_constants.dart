class AppConstants {
  // API Routes
  static const String baseUrl = 'http://localhost:27017/afp_personnel_db';
  // For the emulator, use:
  // static const String baseUrl = 'http://10.0.2.2:27017/afp_personnel_db';
  
  // Authentication Endpoints
  static const String loginEndpoint = '$baseUrl/auth/login';
  static const String registerEndpoint = '$baseUrl/auth/register';
  static const String refreshTokenEndpoint = '$baseUrl/auth/refresh';
  static const String forgotPasswordEndpoint = '$baseUrl/auth/forgot-password';
  static const String resetPasswordEndpoint = '$baseUrl/auth/reset-password';
  static const String validateTokenEndpoint = '$baseUrl/auth/validate-token';
  
  // User Endpoints
  static const String userProfileEndpoint = '$baseUrl/user/profile';
  static const String updateProfileEndpoint = '$baseUrl/user/profile/update';
  static const String changePasswordEndpoint = '$baseUrl/user/change-password';
  
  // Document Endpoints
  static const String documentsEndpoint = '$baseUrl/documents';
  static const String uploadDocumentEndpoint = '$baseUrl/documents/upload';
  static const String documentVerificationEndpoint = '$baseUrl/documents/verify';
  
  // Training Endpoints
  static const String trainingsEndpoint = '$baseUrl/trainings';
  static const String registerTrainingEndpoint = '$baseUrl/trainings/register';
  static const String myTrainingsEndpoint = '$baseUrl/trainings/my-trainings';
  static const String attendedTrainingsEndpoint = '$baseUrl/trainings/attended';
  
  // Policy Endpoints
  static const String policiesEndpoint = '$baseUrl/policies';
  
  // Announcement Endpoints
  static const String announcementsEndpoint = '$baseUrl/announcements';
  
  // Calendar Endpoints
  static const String calendarEventsEndpoint = '$baseUrl/calendar';
  
  // Local Storage Keys
  static const String tokenKey = 'auth_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userDataKey = 'user_data';
  static const String userRoleKey = 'user_role';
  static const String firstTimeKey = 'first_time';
  static const String lastSyncTimeKey = 'last_sync_time';
  static const String themeKey = 'app_theme';
  static const String notificationsKey = 'notifications_enabled';
  
  // App-specific Constants
  static const String appName = '301st Ready Reserve Infantry Battalion';
  static const String appVersion = '1.0.0';
  static const double defaultPadding = 16.0;
  static const double smallPadding = 8.0;
  static const double largePadding = 24.0;
  static const double buttonRadius = 12.0;
  static const double cardRadius = 16.0;
  static const double defaultBorderWidth = 1.0;
  static const double defaultIconSize = 24.0;
  static const double smallIconSize = 16.0;
  static const double largeIconSize = 32.0;
  static const int defaultAnimationDuration = 300; // milliseconds
  
  // Timeout durations
  static const int connectionTimeout = 30000; // 30 seconds
  static const int receiveTimeout = 30000; // 30 seconds
  
  // Military-specific constants
  static const List<String> militaryRanks = [
    'Private',
    'Corporal',
    'Sergeant',
    'Staff Sergeant',
    'Master Sergeant',
    'First Sergeant',
    'Sergeant Major',
    'Second Lieutenant',
    'First Lieutenant',
    'Captain',
    'Major',
    'Lieutenant Colonel',
    'Colonel',
    'Brigadier General',
    'Major General',
    'Lieutenant General',
    'General',
  ];
  
  static const List<String> companies = [
    'Alpha Company',
    'Bravo Company',
    'Charlie Company',
    'Delta Company',
    'Echo Company',
    'Foxtrot Company',
    'Headquarters',
  ];
  
  static const List<String> reservistStatus = [
    'Ready', 
    'Standby', 
    'Retired'
  ];
  
  // Document types
  static const List<String> documentTypes = [
    'ID Card', 
    'Medical Certificate', 
    'Training Certificate', 
    'Deployment Order', 
    'Commendation', 
    'Other'
  ];
  
  // Security classifications
  static const List<String> securityClassifications = [
    'Unclassified', 
    'Confidential', 
    'Secret', 
    'Top Secret'
  ];
  
  // Training types
  static const List<String> trainingTypes = [
    'Basic Military Training', 
    'Advanced Infantry Training', 
    'Leadership Course', 
    'Medical Training', 
    'Communications', 
    'Weapons Training', 
    'Special Operations', 
    'Other'
  ];
} 