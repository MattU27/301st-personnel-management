import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/app_constants.dart';
import '../models/training_model.dart';

class TrainingsScreen extends StatefulWidget {
  const TrainingsScreen({Key? key}) : super(key: key);

  @override
  State<TrainingsScreen> createState() => _TrainingsScreenState();
}

class _TrainingsScreenState extends State<TrainingsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = false;
  
  final List<Training> _upcomingTrainings = [
    Training(
      id: '1',
      title: 'Basic Combat Training',
      type: 'Basic Military Training',
      description: 'Standard combat training for all reservists.',
      startDate: DateTime.now().add(const Duration(days: 10)),
      endDate: DateTime.now().add(const Duration(days: 15)),
      location: 'Main Training Ground, Camp Aguinaldo',
      capacity: 50,
      registeredCount: 30,
      isMandatory: true,
      status: 'scheduled',
      createdAt: DateTime.now().subtract(const Duration(days: 30)),
      updatedAt: DateTime.now().subtract(const Duration(days: 30)),
      createdBy: 'admin123',
    ),
    Training(
      id: '2',
      title: 'Communications Workshop',
      type: 'Communications',
      description: 'Advanced training on military communications systems.',
      startDate: DateTime.now().add(const Duration(days: 20)),
      endDate: DateTime.now().add(const Duration(days: 22)),
      location: 'Communications Center, Camp Aguinaldo',
      capacity: 25,
      registeredCount: 10,
      isMandatory: false,
      status: 'scheduled',
      createdAt: DateTime.now().subtract(const Duration(days: 15)),
      updatedAt: DateTime.now().subtract(const Duration(days: 15)),
      createdBy: 'admin123',
    ),
    Training(
      id: '3',
      title: 'Leadership Development Course',
      type: 'Leadership Course',
      description: 'Leadership training for potential officers.',
      startDate: DateTime.now().add(const Duration(days: 30)),
      endDate: DateTime.now().add(const Duration(days: 35)),
      location: 'Officers Academy, Camp Aguinaldo',
      capacity: 20,
      registeredCount: 15,
      isMandatory: false,
      status: 'scheduled',
      createdAt: DateTime.now().subtract(const Duration(days: 20)),
      updatedAt: DateTime.now().subtract(const Duration(days: 20)),
      createdBy: 'admin123',
    ),
  ];
  
  final List<TrainingRegistration> _myTrainings = [
    TrainingRegistration(
      id: '1',
      trainingId: '4',
      userId: 'user123',
      registrationDate: DateTime.now().subtract(const Duration(days: 30)),
      status: 'attended',
      hasCertificate: true,
      certificateUrl: 'https://example.com/certificates/123',
      certificateIssuedDate: DateTime.now().subtract(const Duration(days: 20)),
      certificateExpiryDate: DateTime.now().add(const Duration(days: 365)),
    ),
    TrainingRegistration(
      id: '2',
      trainingId: '5',
      userId: 'user123',
      registrationDate: DateTime.now().subtract(const Duration(days: 15)),
      status: 'registered',
      hasCertificate: false,
    ),
  ];
  
  // Sample past trainings data
  final List<Training> _pastTrainings = [
    Training(
      id: '4',
      title: 'First Aid Training',
      type: 'Medical Training',
      description: 'Basic first aid skills for field operations.',
      startDate: DateTime.now().subtract(const Duration(days: 20)),
      endDate: DateTime.now().subtract(const Duration(days: 18)),
      location: 'Medical Center, Camp Aguinaldo',
      capacity: 30,
      registeredCount: 30,
      isMandatory: true,
      status: 'completed',
      createdAt: DateTime.now().subtract(const Duration(days: 60)),
      updatedAt: DateTime.now().subtract(const Duration(days: 60)),
      createdBy: 'admin123',
    ),
    Training(
      id: '5',
      title: 'Weapons Handling',
      type: 'Weapons Training',
      description: 'Safe weapons handling and marksmanship.',
      startDate: DateTime.now().subtract(const Duration(days: 40)),
      endDate: DateTime.now().subtract(const Duration(days: 38)),
      location: 'Firing Range, Camp Aguinaldo',
      capacity: 20,
      registeredCount: 20,
      isMandatory: true,
      status: 'completed',
      createdAt: DateTime.now().subtract(const Duration(days: 70)),
      updatedAt: DateTime.now().subtract(const Duration(days: 70)),
      createdBy: 'admin123',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Trainings'),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: const [
            Tab(text: 'Available'),
            Tab(text: 'My Trainings'),
            Tab(text: 'Past'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildAvailableTrainings(),
          _buildMyTrainings(),
          _buildPastTrainings(),
        ],
      ),
    );
  }

  Widget _buildAvailableTrainings() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_upcomingTrainings.isEmpty) {
      return const Center(
        child: Text(
          'No upcoming trainings available',
          style: TextStyle(color: AppTheme.textSecondaryColor),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        // Implement refresh logic
        await Future.delayed(const Duration(seconds: 1));
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(AppConstants.defaultPadding),
        itemCount: _upcomingTrainings.length,
        itemBuilder: (context, index) {
          return _buildTrainingCard(_upcomingTrainings[index]);
        },
      ),
    );
  }

  Widget _buildMyTrainings() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_myTrainings.isEmpty) {
      return const Center(
        child: Text(
          'You have not registered for any trainings',
          style: TextStyle(color: AppTheme.textSecondaryColor),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        // Implement refresh logic
        await Future.delayed(const Duration(seconds: 1));
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(AppConstants.defaultPadding),
        itemCount: _myTrainings.length,
        itemBuilder: (context, index) {
          final registration = _myTrainings[index];
          // In a real app, you would fetch the training details based on the trainingId
          final training = _pastTrainings.firstWhere(
            (t) => t.id == registration.trainingId,
            orElse: () => _upcomingTrainings.firstWhere(
              (t) => t.id == registration.trainingId,
              orElse: () => Training(
                id: 'unknown',
                title: 'Unknown Training',
                type: 'Unknown',
                startDate: DateTime.now(),
                endDate: DateTime.now(),
                location: 'Unknown',
                capacity: 0,
                registeredCount: 0,
                isMandatory: false,
                status: 'unknown',
                createdAt: DateTime.now(),
                updatedAt: DateTime.now(),
                createdBy: 'unknown',
              ),
            ),
          );
          
          return _buildMyTrainingCard(training, registration);
        },
      ),
    );
  }

  Widget _buildPastTrainings() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_pastTrainings.isEmpty) {
      return const Center(
        child: Text(
          'No past trainings available',
          style: TextStyle(color: AppTheme.textSecondaryColor),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        // Implement refresh logic
        await Future.delayed(const Duration(seconds: 1));
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(AppConstants.defaultPadding),
        itemCount: _pastTrainings.length,
        itemBuilder: (context, index) {
          return _buildPastTrainingCard(_pastTrainings[index]);
        },
      ),
    );
  }

  Widget _buildTrainingCard(Training training) {
    final dateFormat = DateFormat('MMM dd, yyyy');
    
    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppConstants.cardRadius),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.defaultPadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.military_tech,
                    color: AppTheme.primaryColor,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        training.title,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        training.type,
                        style: const TextStyle(color: AppTheme.textSecondaryColor),
                      ),
                    ],
                  ),
                ),
                if (training.isMandatory)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppTheme.militaryRed.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppTheme.militaryRed),
                    ),
                    child: const Text(
                      'Mandatory',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.militaryRed,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            if (training.description != null) ...[
              Text(
                training.description!,
                style: const TextStyle(color: AppTheme.textSecondaryColor),
              ),
              const SizedBox(height: 16),
            ],
            _buildInfoRow(Icons.calendar_today, '${dateFormat.format(training.startDate)} - ${dateFormat.format(training.endDate)}'),
            const SizedBox(height: 8),
            _buildInfoRow(Icons.location_on, training.location),
            const SizedBox(height: 8),
            _buildInfoRow(Icons.people, 'Capacity: ${training.registeredCount}/${training.capacity}'),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: LinearProgressIndicator(
                    value: training.capacity > 0 ? training.registeredCount / training.capacity : 0,
                    backgroundColor: Colors.grey.shade300,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      training.registeredCount >= training.capacity 
                        ? AppTheme.warningColor 
                        : AppTheme.successColor,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '${(training.capacity > 0 ? (training.registeredCount / training.capacity) * 100 : 0).toInt()}%',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: training.registeredCount >= training.capacity
                        ? AppTheme.warningColor
                        : AppTheme.successColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                OutlinedButton(
                  onPressed: () {
                    // Show training details
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppTheme.primaryColor,
                    side: BorderSide(color: AppTheme.primaryColor),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                  ),
                  child: const Text('Details'),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: training.hasCapacity ? () {
                    // Register for training
                  } : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: Colors.grey,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                  ),
                  child: Text(training.hasCapacity ? 'Register' : 'Full'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMyTrainingCard(Training training, TrainingRegistration registration) {
    final dateFormat = DateFormat('MMM dd, yyyy');
    
    Color statusColor;
    IconData statusIcon;
    
    switch (registration.status) {
      case 'registered':
        statusColor = AppTheme.infoColor;
        statusIcon = Icons.event_available;
        break;
      case 'attended':
        statusColor = AppTheme.successColor;
        statusIcon = Icons.check_circle;
        break;
      case 'cancelled':
        statusColor = AppTheme.errorColor;
        statusIcon = Icons.cancel;
        break;
      case 'absent':
        statusColor = AppTheme.warningColor;
        statusIcon = Icons.warning;
        break;
      default:
        statusColor = AppTheme.textSecondaryColor;
        statusIcon = Icons.help;
    }
    
    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppConstants.cardRadius),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.defaultPadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    statusIcon,
                    color: statusColor,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        training.title,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        training.type,
                        style: const TextStyle(color: AppTheme.textSecondaryColor),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: statusColor),
                  ),
                  child: Text(
                    _getStatusText(registration.status),
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: statusColor,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildInfoRow(Icons.calendar_today, '${dateFormat.format(training.startDate)} - ${dateFormat.format(training.endDate)}'),
            const SizedBox(height: 8),
            _buildInfoRow(Icons.location_on, training.location),
            const SizedBox(height: 8),
            _buildInfoRow(Icons.event_note, 'Registered on: ${dateFormat.format(registration.registrationDate)}'),
            
            if (registration.hasCertificate) ...[
              const SizedBox(height: 16),
              const Divider(),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(
                    Icons.workspace_premium,
                    color: AppTheme.accentColor,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Certificate Available',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: AppTheme.accentColor,
                          ),
                        ),
                        if (registration.certificateExpiryDate != null)
                          Text(
                            'Valid until: ${dateFormat.format(registration.certificateExpiryDate!)}',
                            style: TextStyle(
                              fontSize: 12,
                              color: registration.certificateIsValid
                                  ? AppTheme.textSecondaryColor
                                  : AppTheme.errorColor,
                            ),
                          ),
                      ],
                    ),
                  ),
                  OutlinedButton.icon(
                    onPressed: () {
                      // View certificate
                    },
                    icon: const Icon(Icons.remove_red_eye),
                    label: const Text('View'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.accentColor,
                      side: BorderSide(color: AppTheme.accentColor),
                    ),
                  ),
                ],
              ),
            ],
            
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                OutlinedButton(
                  onPressed: () {
                    // View training details
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppTheme.primaryColor,
                    side: BorderSide(color: AppTheme.primaryColor),
                  ),
                  child: const Text('Details'),
                ),
                const SizedBox(width: 8),
                if (registration.status == 'registered')
                  ElevatedButton(
                    onPressed: () {
                      // Cancel registration
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.errorColor,
                      foregroundColor: Colors.white,
                    ),
                    child: const Text('Cancel'),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPastTrainingCard(Training training) {
    final dateFormat = DateFormat('MMM dd, yyyy');
    
    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppConstants.cardRadius),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.defaultPadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.grey.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.history,
                    color: AppTheme.textSecondaryColor,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        training.title,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        training.type,
                        style: const TextStyle(color: AppTheme.textSecondaryColor),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.grey.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.grey),
                  ),
                  child: const Text(
                    'Completed',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (training.description != null) ...[
              Text(
                training.description!,
                style: const TextStyle(color: AppTheme.textSecondaryColor),
              ),
              const SizedBox(height: 16),
            ],
            _buildInfoRow(Icons.calendar_today, '${dateFormat.format(training.startDate)} - ${dateFormat.format(training.endDate)}'),
            const SizedBox(height: 8),
            _buildInfoRow(Icons.location_on, training.location),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: () {
                // View training details
              },
              icon: const Icon(Icons.info_outline),
              label: const Text('View Details'),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppTheme.primaryColor,
                side: BorderSide(color: AppTheme.primaryColor),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String text) {
    return Row(
      children: [
        Icon(
          icon,
          size: 16,
          color: AppTheme.textSecondaryColor,
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(color: AppTheme.textSecondaryColor),
          ),
        ),
      ],
    );
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'registered':
        return 'Registered';
      case 'attended':
        return 'Attended';
      case 'cancelled':
        return 'Cancelled';
      case 'absent':
        return 'Absent';
      default:
        return 'Unknown';
    }
  }
} 