import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/app_constants.dart';
import '../models/user_model.dart';
import './trainings_screen.dart';
import './documents_screen.dart';

// Create a global variable to track notifications state across screens
class NotificationState {
  static final List<Map<String, dynamic>> _announcements = [
    {
      'id': '1',
      'title': 'Annual Training Schedule Released',
      'content': 'The annual training schedule for 2024 has been released. Please check your training tab for details.',
      'date': DateTime.now().subtract(const Duration(days: 2)),
      'isImportant': true,
      'isRead': false,
      'targetType': 'training',
      'targetId': '1', // ID of the related training
    },
    {
      'id': '2',
      'title': 'New Document Requirements',
      'content': 'All personnel must upload updated medical certificates by the end of the month.',
      'date': DateTime.now().subtract(const Duration(days: 5)),
      'isImportant': false,
      'isRead': false,
      'targetType': 'document',
      'targetId': 'medical_certificates', // ID or category of document
    },
    {
      'id': '3',
      'title': 'System Maintenance',
      'content': 'The system will be undergoing maintenance this weekend. Some features may be unavailable.',
      'date': DateTime.now().subtract(const Duration(days: 7)),
      'isImportant': false,
      'isRead': false,
      'targetType': 'notification', // No specific navigation target
      'targetId': null,
    },
  ];

  static List<Map<String, dynamic>> get announcements => _announcements;
  
  static int get unreadCount {
    return _announcements.where((notification) => notification['isRead'] == false).length;
  }
  
  static void markAsRead(String id) {
    final notification = _announcements.firstWhere((n) => n['id'] == id, orElse: () => {});
    if (notification.isNotEmpty) {
      notification['isRead'] = true;
    }
  }
  
  static void markAllAsRead() {
    for (var notification in _announcements) {
      notification['isRead'] = true;
    }
  }
}

class HomeScreen extends StatefulWidget {
  final User? user;
  
  const HomeScreen({
    Key? key,
    required this.user,
  }) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isLoading = false;
  
  // Sample data for upcoming trainings
  final List<Map<String, dynamic>> _upcomingTrainings = [
    {
      'id': '1',
      'title': 'Combat First Aid Training',
      'startDate': DateTime.now().add(const Duration(days: 10)),
      'endDate': DateTime.now().add(const Duration(days: 12)),
      'location': 'Medical Wing, HQ Building',
      'isMandatory': true,
    },
    {
      'id': '2',
      'title': 'Leadership Development Course',
      'startDate': DateTime.now().add(const Duration(days: 15)),
      'endDate': DateTime.now().add(const Duration(days: 20)),
      'location': 'Training Center Alpha',
      'isMandatory': false,
    },
    {
      'id': '3',
      'title': 'Tactical Communications Workshop',
      'startDate': DateTime.now().add(const Duration(days: 25)),
      'endDate': DateTime.now().add(const Duration(days: 26)),
      'location': 'Signal Corps Facility',
      'isMandatory': true,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Home'),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          // Notification bell with badge
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.notifications),
                onPressed: () {
                  _showNotificationsDialog(context);
                },
              ),
              if (NotificationState.unreadCount > 0)
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    constraints: const BoxConstraints(
                      minWidth: 16,
                      minHeight: 16,
                    ),
                    child: Text(
                      NotificationState.unreadCount.toString(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          setState(() {
            _isLoading = true;
          });
          
          // Simulate data refresh
          await Future.delayed(const Duration(seconds: 1));
          
          setState(() {
            _isLoading = false;
          });
        },
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : SingleChildScrollView(
                padding: const EdgeInsets.all(AppConstants.defaultPadding),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildWelcomeCard(),
                    const SizedBox(height: 24),
                    _buildStatusCard(),
                    const SizedBox(height: 24),
                    _buildAnnouncementsSection(),
                    const SizedBox(height: 24),
                    _buildUpcomingTrainingsSection(),
                  ],
                ),
              ),
      ),
    );
  }
  
  Widget _buildWelcomeCard() {
    final currentTime = DateTime.now().hour;
    String greeting;
    
    if (currentTime < 12) {
      greeting = 'Good Morning';
    } else if (currentTime < 17) {
      greeting = 'Good Afternoon';
    } else {
      greeting = 'Good Evening';
    }
    
    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppConstants.cardRadius),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.defaultPadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '$greeting,',
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryColor,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              widget.user?.rank != null 
                ? '${widget.user!.rank} ${widget.user!.lastName}'
                : widget.user?.firstName ?? 'User',
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Today is ${DateFormat('EEEE, MMMM d, yyyy').format(DateTime.now())}',
              style: const TextStyle(
                color: AppTheme.textSecondaryColor,
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildStatusCard() {
    String statusText;
    Color statusColor;
    IconData statusIcon;
    String readinessPercentage = '85%'; // Sample data
    
    switch (widget.user?.status) {
      case 'Ready':
        statusText = 'Ready for Deployment';
        statusColor = AppTheme.successColor;
        statusIcon = Icons.check_circle;
        break;
      case 'Standby':
        statusText = 'Standby Status';
        statusColor = AppTheme.warningColor;
        statusIcon = Icons.warning;
        break;
      case 'Training':
        statusText = 'In Training';
        statusColor = AppTheme.primaryColor;
        statusIcon = Icons.school;
        break;
      case 'Deployed':
        statusText = 'Currently Deployed';
        statusColor = AppTheme.militaryGreen;
        statusIcon = Icons.flight_takeoff;
        break;
      default:
        statusText = 'Status Unknown';
        statusColor = AppTheme.textSecondaryColor;
        statusIcon = Icons.help_outline;
    }
    
    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppConstants.cardRadius),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.defaultPadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'CURRENT STATUS',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: AppTheme.textSecondaryColor,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    statusIcon,
                    color: statusColor,
                    size: 32,
                  ),
                ),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      statusText,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: statusColor,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Readiness: $readinessPercentage',
                      style: const TextStyle(
                        color: AppTheme.textSecondaryColor,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            LinearProgressIndicator(
              value: 0.85, // Sample data
              backgroundColor: Colors.grey[200],
              valueColor: AlwaysStoppedAnimation<Color>(statusColor),
              minHeight: 10,
              borderRadius: BorderRadius.circular(5),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildAnnouncementsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'ANNOUNCEMENTS',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: AppTheme.textSecondaryColor,
                letterSpacing: 1.2,
              ),
            ),
            TextButton(
              onPressed: () {
                // Navigate to all announcements
              },
              child: const Text('See All'),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ...NotificationState.announcements.map((announcement) => _buildAnnouncementCard(announcement)).toList(),
      ],
    );
  }
  
  Widget _buildAnnouncementCard(Map<String, dynamic> announcement) {
    final isImportant = announcement['isImportant'] as bool;
    final date = announcement['date'] as DateTime;
    
    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppConstants.cardRadius),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppConstants.cardRadius),
          border: isImportant 
            ? Border.all(color: AppTheme.accentColor, width: 2)
            : null,
        ),
        child: Padding(
          padding: const EdgeInsets.all(AppConstants.defaultPadding),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      announcement['title'],
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                  ),
                  if (isImportant)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.accentColor,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Text(
                        'Important',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                announcement['content'],
                style: const TextStyle(
                  color: AppTheme.textPrimaryColor,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                DateFormat('MMM dd, yyyy').format(date),
                style: const TextStyle(
                  color: AppTheme.textSecondaryColor,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildUpcomingTrainingsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'UPCOMING TRAININGS',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: AppTheme.textSecondaryColor,
                letterSpacing: 1.2,
              ),
            ),
            TextButton(
              onPressed: () {
                // Navigate to all trainings
              },
              child: const Text('See All'),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ..._upcomingTrainings.map((training) => _buildTrainingCard(training)).toList(),
      ],
    );
  }
  
  Widget _buildTrainingCard(Map<String, dynamic> training) {
    final startDate = training['startDate'] as DateTime;
    final endDate = training['endDate'] as DateTime;
    final isMandatory = training['isMandatory'] as bool;
    
    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppConstants.cardRadius),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppConstants.cardRadius),
          border: isMandatory 
            ? Border.all(color: AppTheme.militaryRed, width: 2)
            : null,
        ),
        child: Padding(
          padding: const EdgeInsets.all(AppConstants.defaultPadding),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      training['title'],
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                  ),
                  if (isMandatory)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.militaryRed,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Text(
                        'Mandatory',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(
                    Icons.event,
                    size: 16,
                    color: AppTheme.textSecondaryColor,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    startDate.day == endDate.day && startDate.month == endDate.month && startDate.year == endDate.year
                        ? '${DateFormat('MMM dd, yyyy').format(startDate)}'
                        : '${DateFormat('MMM dd').format(startDate)} - ${DateFormat('MMM dd, yyyy').format(endDate)}',
                    style: const TextStyle(
                      color: AppTheme.textSecondaryColor,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(
                    Icons.location_on,
                    size: 16,
                    color: AppTheme.textSecondaryColor,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    training['location'],
                    style: const TextStyle(
                      color: AppTheme.textSecondaryColor,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () {
                      // View training details
                    },
                    child: const Text('Details'),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: () {
                      // Register for training
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryColor,
                      foregroundColor: Colors.white,
                    ),
                    child: const Text('Register'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Show notifications dialog
  void _showNotificationsDialog(BuildContext context) {
    // Ensure we don't trigger navigation just by opening the notification drawer
    print('Opening notification dialog - this should not trigger navigation');
    
    // Use isScrollControlled to make it larger and show more content
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      // Don't dismiss when tapping outside to prevent accidental navigation
      isDismissible: true,
      enableDrag: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      routeSettings: const RouteSettings(name: 'notification_dialog'), // Named route helps with debugging
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return Container(
              height: MediaQuery.of(context).size.height * 0.7,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Notifications',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          // Mark all as read
                          NotificationState.markAllAsRead();
                          
                          // Update UI
                          setState(() {});
                          this.setState(() {});
                        },
                        child: const Text('Mark all as read'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Expanded(
                    child: ListView.separated(
                      itemCount: NotificationState.announcements.length,
                      separatorBuilder: (context, index) => const Divider(),
                      itemBuilder: (context, index) {
                        final notification = NotificationState.announcements[index];
                        // Ensure isRead is always a boolean
                        final isRead = notification['isRead'] ?? false;
                        final isImportant = notification['isImportant'] ?? false;
                        
                        return ListTile(
                          leading: CircleAvatar(
                            backgroundColor: isRead 
                              ? AppTheme.textSecondaryColor.withOpacity(0.2)
                              : AppTheme.primaryColor,
                            foregroundColor: Colors.white,
                            child: Icon(
                              isImportant 
                                ? Icons.priority_high 
                                : Icons.notifications,
                            ),
                          ),
                          title: Text(
                            notification['title'] ?? 'No Title',
                            style: TextStyle(
                              fontWeight: isRead 
                                ? FontWeight.normal 
                                : FontWeight.bold,
                            ),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                notification['content'] ?? 'No content',
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                notification['date'] != null 
                                  ? DateFormat('MMM d, yyyy').format(notification['date'])
                                  : 'No date',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: AppTheme.textSecondaryColor,
                                ),
                              ),
                            ],
                          ),
                          onTap: () {
                            // Show notification details immediately in a dialog
                            // without closing the bottom sheet first
                            _showNotificationDetailsInBottomSheet(
                              context, 
                              notification,
                              () {
                                // Mark as read when details are viewed
                                if (!isRead) {
                                  NotificationState.markAsRead(notification['id']);
                                  
                                  // Update UI
                                  setState(() {});
                                  this.setState(() {});
                                }
                              }
                            );
                          },
                        );
                      },
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
  
  // Show notification details directly in the bottom sheet
  void _showNotificationDetailsInBottomSheet(
    BuildContext context, 
    Map<String, dynamic> notification,
    VoidCallback onDetailsViewed
  ) {
    final hasNavigationTarget = notification['targetType'] != null && 
                               notification['targetType'] != 'notification';
    final targetType = notification['targetType'] as String? ?? '';
    
    String actionButtonText = 'View Details';
    switch (targetType) {
      case 'training':
        actionButtonText = 'Go to Training';
        break;
      case 'document':
        actionButtonText = 'View Document';
        break;
      default:
        actionButtonText = 'View Details';
    }
    
    // Call the callback to mark as read
    onDetailsViewed();
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(notification['title'] ?? 'Notification'),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(notification['content'] ?? ''),
              const SizedBox(height: 16),
              Text(
                'Date: ${notification['date'] != null ? DateFormat('MMMM d, yyyy').format(notification['date']) : 'Unknown date'}',
                style: const TextStyle(
                  color: AppTheme.textSecondaryColor,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
          if (hasNavigationTarget)
            ElevatedButton(
              onPressed: () {
                // Close the details dialog
                Navigator.pop(context);
                // Close the bottom sheet
                Navigator.pop(context);
                
                // Debug print to trace the flow
                print('Action button clicked for targetType: $targetType');
                
                // Navigate based on notification type
                // Using explicit navigation to the correct tab
                final Map<String, dynamic> params = {
                  'targetId': notification['targetId'],
                };
                
                if (targetType == 'document') {
                  // Explicitly navigate to documents tab (index 2)
                  print('Navigating directly to DOCUMENTS tab');
                  Navigator.of(context).pushNamedAndRemoveUntil(
                    '/dashboard',
                    (route) => false,
                    arguments: {
                      'initialTabIndex': 2,
                      'params': params,
                    },
                  );
                } else if (targetType == 'training') {
                  // Explicitly navigate to trainings tab (index 1)
                  print('Navigating directly to TRAININGS tab');
                  Navigator.of(context).pushNamedAndRemoveUntil(
                    '/dashboard',
                    (route) => false,
                    arguments: {
                      'initialTabIndex': 1,
                      'params': params,
                    },
                  );
                } else {
                  // Default to home tab
                  Navigator.of(context).pushNamedAndRemoveUntil(
                    '/dashboard',
                    (route) => false,
                    arguments: {
                      'initialTabIndex': 0,
                      'params': params,
                    },
                  );
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryColor,
                foregroundColor: Colors.white,
              ),
              child: Text(actionButtonText),
            ),
        ],
      ),
    );
  }
  
  // This method is now only used from announcement cards on the home page
  void _showNotificationDetails(BuildContext context, Map<String, dynamic> notification) {
    final hasNavigationTarget = notification['targetType'] != null && 
                               notification['targetType'] != 'notification';
    
    String actionButtonText = 'View Details';
    switch (notification['targetType']) {
      case 'training':
        actionButtonText = 'Go to Training';
        break;
      case 'document':
        actionButtonText = 'View Document';
        break;
      default:
        actionButtonText = 'View Details';
    }
    
    // Mark notification as read
    NotificationState.markAsRead(notification['id']);
    setState(() {});
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(notification['title'] ?? 'Notification'),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(notification['content'] ?? ''),
              const SizedBox(height: 16),
              Text(
                'Date: ${notification['date'] != null ? DateFormat('MMMM d, yyyy').format(notification['date']) : 'Unknown date'}',
                style: const TextStyle(
                  color: AppTheme.textSecondaryColor,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
          if (hasNavigationTarget)
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _navigateToTarget(notification['targetType'], notification['targetId']);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryColor,
                foregroundColor: Colors.white,
              ),
              child: Text(actionButtonText),
            ),
        ],
      ),
    );
  }
  
  // Navigate to the target based on type and ID
  void _navigateToTarget(String targetType, String? targetId) {
    // This print will help debug navigation issues
    print('_navigateToTarget called with type: $targetType, id: $targetId');
    
    // First pop back to close any open dialogs (if any still open)
    if (Navigator.canPop(context)) {
      Navigator.of(context).pop();
    }

    // If we're already in the dashboard, we need to use a different approach
    // to avoid recreating the entire dashboard
    final currentRoute = ModalRoute.of(context);
    final isInDashboard = currentRoute?.settings.name == '/dashboard';
    
    print('isInDashboard: $isInDashboard');
    
    // Create a map to store any parameters we want to pass
    final Map<String, dynamic> params = {
      'targetId': targetId,
    };
    
    // Get the tab index based on target type
    int tabIndex;
    switch (targetType) {
      case 'training':
        tabIndex = 1; // Trainings tab
        break;
      case 'document':
        tabIndex = 2; // Documents tab
        break;
      default:
        tabIndex = 0; // Home tab
    }
    
    // Navigate based on current location
    if (isInDashboard) {
      // If already in dashboard, just update the tab index through the dashboard widget
      // This prevents rebuilding the entire dashboard
      print('Already in dashboard, using Navigator to update tab index to $tabIndex');
      Navigator.of(context).pushReplacementNamed(
        '/dashboard',
        arguments: {
          'initialTabIndex': tabIndex,
          'params': params,
        },
      );
    } else {
      // Not in dashboard, do a full navigation
      print('Not in dashboard, navigating to dashboard with tab index $tabIndex');
      Navigator.of(context).pushNamedAndRemoveUntil(
        '/dashboard',
        (route) => false,
        arguments: {
          'initialTabIndex': tabIndex,
          'params': params,
        },
      );
    }
  }
} 