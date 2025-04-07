import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/app_constants.dart';
import '../models/user_model.dart';

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
  
  // Sample data for announcements
  final List<Map<String, dynamic>> _announcements = [
    {
      'id': '1',
      'title': 'Annual Training Schedule Released',
      'content': 'The annual training schedule for 2024 has been released. Please check your training tab for details.',
      'date': DateTime.now().subtract(const Duration(days: 2)),
      'isImportant': true,
    },
    {
      'id': '2',
      'title': 'New Document Requirements',
      'content': 'All personnel must upload updated medical certificates by the end of the month.',
      'date': DateTime.now().subtract(const Duration(days: 5)),
      'isImportant': false,
    },
    {
      'id': '3',
      'title': 'System Maintenance',
      'content': 'The system will be undergoing maintenance this weekend. Some features may be unavailable.',
      'date': DateTime.now().subtract(const Duration(days: 7)),
      'isImportant': false,
    },
  ];
  
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
        ..._announcements.map((announcement) => _buildAnnouncementCard(announcement)).toList(),
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
} 