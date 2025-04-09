import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/app_constants.dart';
import '../models/user_model.dart';
import '../core/services/auth_service.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_text_field.dart';

class ProfileScreen extends StatefulWidget {
  final User? user;
  final VoidCallback? onLogout;
  
  const ProfileScreen({
    Key? key,
    required this.user,
    this.onLogout,
  }) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = false;
  bool _isEditing = false;
  
  // Controllers for editing profile
  late TextEditingController _firstNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _middleNameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  late TextEditingController _addressController;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    
    // Initialize text controllers with user data
    _firstNameController = TextEditingController(text: widget.user?.firstName);
    _lastNameController = TextEditingController(text: widget.user?.lastName);
    _middleNameController = TextEditingController(text: widget.user?.middleName ?? '');
    _emailController = TextEditingController(text: widget.user?.email);
    _phoneController = TextEditingController(text: widget.user?.phoneNumber ?? '');
    _addressController = TextEditingController(text: widget.user?.address ?? '');
  }
  
  @override
  void dispose() {
    _tabController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    _middleNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          if (!_isEditing)
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: () {
                setState(() {
                  _isEditing = true;
                });
              },
            ),
          if (_isEditing)
            IconButton(
              icon: const Icon(Icons.cancel),
              onPressed: () {
                setState(() {
                  _isEditing = false;
                  // Reset controllers to original values
                  _firstNameController.text = widget.user?.firstName ?? '';
                  _lastNameController.text = widget.user?.lastName ?? '';
                  _middleNameController.text = widget.user?.middleName ?? '';
                  _emailController.text = widget.user?.email ?? '';
                  _phoneController.text = widget.user?.phoneNumber ?? '';
                  _addressController.text = widget.user?.address ?? '';
                });
              },
            ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: const [
            Tab(text: 'Personal'),
            Tab(text: 'Military'),
            Tab(text: 'Settings'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildPersonalInfoTab(),
          _buildMilitaryInfoTab(),
          _buildSettingsTab(),
        ],
      ),
      bottomNavigationBar: _isEditing 
          ? Padding(
              padding: const EdgeInsets.all(AppConstants.defaultPadding),
              child: CustomButton(
                text: 'Save Changes',
                onPressed: _saveProfileChanges,
                isLoading: _isLoading,
              ),
            )
          : null,
    );
  }
  
  Widget _buildPersonalInfoTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppConstants.defaultPadding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildProfileHeader(),
          const SizedBox(height: 24),
          _isEditing
              ? _buildEditPersonalInfo()
              : _buildPersonalInfoDisplay(),
        ],
      ),
    );
  }
  
  Widget _buildProfileHeader() {
    return Center(
      child: Column(
        children: [
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: AppTheme.primaryColor,
                width: 2,
              ),
              image: widget.user?.profileImageUrl != null
                  ? DecorationImage(
                      image: NetworkImage(widget.user!.profileImageUrl!),
                      fit: BoxFit.cover,
                    )
                  : null,
            ),
            child: widget.user?.profileImageUrl == null
                ? Center(
                    child: Text(
                      _getInitials(),
                      style: const TextStyle(
                        fontSize: 48,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primaryColor,
                      ),
                    ),
                  )
                : null,
          ),
          const SizedBox(height: 16),
          if (_isEditing)
            TextButton.icon(
              onPressed: () {
                // Implement profile picture upload
              },
              icon: const Icon(Icons.camera_alt),
              label: const Text('Change Photo'),
              style: TextButton.styleFrom(
                foregroundColor: AppTheme.primaryColor,
              ),
            ),
          if (!_isEditing) ...[
            Text(
              '${widget.user?.firstName} ${widget.user?.lastName}',
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              widget.user?.rank ?? 'Civilian',
              style: const TextStyle(
                fontSize: 18,
                color: AppTheme.textSecondaryColor,
              ),
            ),
            if (widget.user?.company != null) ...[
              const SizedBox(height: 4),
              Text(
                'Company ${widget.user?.company}',
                style: const TextStyle(
                  fontSize: 16,
                  color: AppTheme.textSecondaryColor,
                ),
              ),
            ],
          ],
        ],
      ),
    );
  }
  
  Widget _buildPersonalInfoDisplay() {
    final dateFormat = DateFormat('MMMM d, yyyy');
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Divider(),
        _buildInfoRow('First Name', widget.user?.firstName ?? ''),
        const Divider(),
        _buildInfoRow('Middle Name', widget.user?.middleName ?? 'Not provided'),
        const Divider(),
        _buildInfoRow('Last Name', widget.user?.lastName ?? ''),
        const Divider(),
        _buildInfoRow('Email', widget.user?.email ?? ''),
        const Divider(),
        _buildInfoRow('Phone', widget.user?.phoneNumber ?? 'Not provided'),
        const Divider(),
        _buildInfoRow('Address', widget.user?.address ?? 'Not provided'),
        const Divider(),
        _buildInfoRow(
          'Date of Birth', 
          widget.user?.dateOfBirth != null 
              ? dateFormat.format(widget.user!.dateOfBirth!)
              : 'Not provided'
        ),
        const Divider(),
      ],
    );
  }
  
  Widget _buildEditPersonalInfo() {
    return Form(
      child: Column(
        children: [
          CustomTextField(
            controller: _firstNameController,
            labelText: 'First Name',
            hintText: 'Enter your first name',
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter your first name';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          CustomTextField(
            controller: _middleNameController,
            labelText: 'Middle Name',
            hintText: 'Enter your middle name (optional)',
          ),
          const SizedBox(height: 16),
          CustomTextField(
            controller: _lastNameController,
            labelText: 'Last Name',
            hintText: 'Enter your last name',
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter your last name';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          CustomTextField(
            controller: _emailController,
            labelText: 'Email',
            hintText: 'Enter your email address',
            keyboardType: TextInputType.emailAddress,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter your email';
              }
              if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                return 'Please enter a valid email address';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          CustomTextField(
            controller: _phoneController,
            labelText: 'Phone',
            hintText: 'Enter your phone number',
            keyboardType: TextInputType.phone,
          ),
          const SizedBox(height: 16),
          CustomTextField(
            controller: _addressController,
            labelText: 'Address',
            hintText: 'Enter your address',
            maxLines: 3,
          ),
        ],
      ),
    );
  }
  
  Widget _buildMilitaryInfoTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppConstants.defaultPadding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 16),
          _buildStatusCard(),
          const SizedBox(height: 24),
          _buildMilitaryInfo(),
        ],
      ),
    );
  }
  
  Widget _buildStatusCard() {
    String statusText;
    Color statusColor;
    IconData statusIcon;
    
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
        child: Row(
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
                const Text(
                  'Current Status',
                  style: TextStyle(
                    fontSize: 16,
                    color: AppTheme.textSecondaryColor,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  statusText,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: statusColor,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildMilitaryInfo() {
    final dateFormat = DateFormat('MMMM d, yyyy');
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Military Information',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        const Divider(),
        _buildInfoRow('Military ID', widget.user?.id ?? ''),
        const Divider(),
        _buildInfoRow('Rank', widget.user?.rank ?? 'Not assigned'),
        const Divider(),
        _buildInfoRow('Company', widget.user?.company ?? 'Not assigned'),
        const Divider(),
        _buildInfoRow('Status', widget.user?.status ?? 'Not specified'),
        const Divider(),
        _buildInfoRow(
          'Date Enlisted', 
          widget.user?.joiningDate != null 
              ? dateFormat.format(widget.user!.joiningDate!)
              : 'Not provided'
        ),
        const Divider(),
        _buildInfoRow(
          'Years of Service', 
          widget.user?.joiningDate != null 
              ? '${DateTime.now().difference(widget.user!.joiningDate!).inDays ~/ 365} years'
              : 'Not available'
        ),
        const Divider(),
        
        const SizedBox(height: 24),
        const Text(
          'Qualifications & Specializations',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        
        _buildSpecializationsList(),
      ],
    );
  }
  
  Widget _buildSpecializationsList() {
    final specializations = widget.user?.specializations ?? [];
    
    if (specializations.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 16),
        child: Center(
          child: Text(
            'No specializations found',
            style: TextStyle(color: AppTheme.textSecondaryColor),
          ),
        ),
      );
    }
    
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: specializations.length,
      itemBuilder: (context, index) {
        final specialization = specializations[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          child: ListTile(
            leading: const Icon(Icons.military_tech, color: AppTheme.primaryColor),
            title: Text(specialization),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              // View specialization details
            },
          ),
        );
      },
    );
  }
  
  Widget _buildSettingsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppConstants.defaultPadding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Account Settings',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          _buildSettingItem(
            icon: Icons.lock_outline,
            title: 'Change Password',
            onTap: () {
              // Navigate to change password screen
            },
          ),
          _buildSettingItem(
            icon: Icons.notifications_outlined,
            title: 'Notification Settings',
            onTap: () {
              // Navigate to notification settings
            },
          ),
          _buildSettingItem(
            icon: Icons.privacy_tip_outlined,
            title: 'Privacy Settings',
            onTap: () {
              // Navigate to privacy settings
            },
          ),
          
          const SizedBox(height: 24),
          const Text(
            'App Settings',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          _buildSettingItem(
            icon: Icons.language_outlined,
            title: 'Language',
            value: 'English',
            onTap: () {
              // Open language selection
            },
          ),
          _buildSettingItem(
            icon: Icons.brightness_6_outlined,
            title: 'Dark Mode',
            trailing: Switch(
              value: false, // Get this from theme provider
              onChanged: (value) {
                // Toggle theme
              },
              activeColor: AppTheme.primaryColor,
            ),
            onTap: () {},
          ),
          
          const SizedBox(height: 24),
          const Text(
            'About',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          _buildSettingItem(
            icon: Icons.info_outline,
            title: 'App Version',
            value: '1.0.0',
            onTap: () {},
          ),
          _buildSettingItem(
            icon: Icons.privacy_tip_outlined,
            title: 'Terms of Service',
            onTap: () {
              // Open terms of service
            },
          ),
          _buildSettingItem(
            icon: Icons.policy_outlined,
            title: 'Privacy Policy',
            onTap: () {
              // Open privacy policy
            },
          ),
          
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _confirmLogout,
              icon: const Icon(Icons.logout),
              label: const Text('Logout'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.militaryRed,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildSettingItem({
    required IconData icon,
    required String title,
    String? value,
    Widget? trailing,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: AppTheme.primaryColor),
      title: Text(title),
      subtitle: value != null ? Text(value) : null,
      trailing: trailing ?? const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
  
  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: const TextStyle(
                color: AppTheme.textSecondaryColor,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  String _getInitials() {
    final firstName = widget.user?.firstName ?? '';
    final lastName = widget.user?.lastName ?? '';
    
    if (firstName.isEmpty && lastName.isEmpty) {
      return '';
    }
    
    final firstInitial = firstName.isNotEmpty ? firstName[0] : '';
    final lastInitial = lastName.isNotEmpty ? lastName[0] : '';
    
    return '$firstInitial$lastInitial'.toUpperCase();
  }
  
  Future<void> _saveProfileChanges() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      // In a real app, you would call the API service to update the user profile
      await Future.delayed(const Duration(seconds: 2)); // Simulate API call
      
      // Update successful
      setState(() {
        _isLoading = false;
        _isEditing = false;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profile updated successfully'),
          backgroundColor: AppTheme.successColor,
        ),
      );
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to update profile: ${e.toString()}'),
          backgroundColor: AppTheme.errorColor,
        ),
      );
    }
  }
  
  void _confirmLogout() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Logout'),
        content: const Text('Are you sure you want to log out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _logout();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.militaryRed,
              foregroundColor: Colors.white,
            ),
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }
  
  Future<void> _logout() async {
    if (!mounted) return;
    
    try {
      // If the parent provided a logout callback, use it instead of handling logout directly
      if (widget.onLogout != null) {
        widget.onLogout!();
        return;
      }
      
      // Only run this code if no callback is provided
      setState(() {
        _isLoading = true;
      });
      
      final authService = AuthService();
      await authService.logout();
      
      // Only navigate if still mounted
      if (mounted) {
        Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
      }
    } catch (e) {
      // Only update state if still mounted
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to logout: ${e.toString()}'),
            backgroundColor: AppTheme.errorColor,
          ),
        );
      }
    }
  }
} 