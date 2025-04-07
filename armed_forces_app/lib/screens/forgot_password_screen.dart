import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../core/constants/app_constants.dart';
import '../core/theme/app_theme.dart';
import '../core/services/auth_service.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_text_field.dart';
import './login_screen.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({Key? key}) : super(key: key);

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final TextEditingController _emailController = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  bool _emailSent = false;
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _resetPassword() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final authService = Provider.of<AuthService>(context, listen: false);
      final result = await authService.forgotPassword(
        _emailController.text.trim(),
      );

      if (result['success']) {
        setState(() {
          _emailSent = true;
        });
      } else {
        setState(() {
          _errorMessage = result['message'];
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'An unexpected error occurred. Please try again.';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.primaryColor),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'Forgot Password',
          style: GoogleFonts.roboto(
            color: AppTheme.textPrimaryColor,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: _emailSent ? _buildSuccessView() : _buildFormView(),
          ),
        ),
      ),
    );
  }

  Widget _buildFormView() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Text(
            "Reset Your Password",
            style: GoogleFonts.roboto(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimaryColor,
            ),
          ).animate().fadeIn(duration: 600.ms).slideX(
            begin: -30,
            end: 0,
            curve: Curves.easeOutQuad,
            duration: 800.ms,
          ),
          const SizedBox(height: 12),
          
          Text(
            "Please enter your email address. We will send you instructions to reset your password.",
            style: GoogleFonts.roboto(
              fontSize: 16,
              color: AppTheme.textSecondaryColor,
            ),
          ).animate().fadeIn(delay: 200.ms, duration: 600.ms),
          
          const SizedBox(height: 32),
          
          // Illustration
          Center(
            child: Container(
              width: 200,
              height: 200,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.lock_reset,
                size: 100,
                color: AppTheme.primaryColor,
              ),
            ),
          ).animate().fadeIn(delay: 400.ms, duration: 800.ms),
          
          const SizedBox(height: 32),
          
          // Error message if any
          if (_errorMessage != null)
            Container(
              padding: const EdgeInsets.all(AppConstants.smallPadding),
              margin: const EdgeInsets.only(bottom: AppConstants.defaultPadding),
              decoration: BoxDecoration(
                color: AppTheme.errorColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(AppConstants.buttonRadius),
                border: Border.all(color: AppTheme.errorColor),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.error_outline,
                    color: AppTheme.errorColor,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _errorMessage!,
                      style: const TextStyle(color: AppTheme.errorColor),
                    ),
                  ),
                ],
              ),
            ).animate().shake(),
          
          // Email field
          CustomTextField(
            controller: _emailController,
            labelText: 'Email',
            hintText: 'Enter your email address',
            prefixIcon: Icons.email,
            keyboardType: TextInputType.emailAddress,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Email is required';
              }
              if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                return 'Please enter a valid email';
              }
              return null;
            },
          ).animate().fadeIn(delay: 600.ms, duration: 600.ms),
          
          const SizedBox(height: 32),
          
          // Submit button
          CustomButton(
            text: 'Send Reset Link',
            isLoading: _isLoading,
            onPressed: _resetPassword,
          ).animate().fadeIn(delay: 800.ms, duration: 600.ms).scale(
            begin: const Offset(0.95, 0.95),
            end: const Offset(1, 1),
            duration: 800.ms,
          ),
          
          const SizedBox(height: 24),
          
          // Back to login
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Remember your password?'),
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                },
                child: const Text(
                  'Login',
                  style: TextStyle(
                    color: AppTheme.primaryColor,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ).animate().fadeIn(delay: 1000.ms, duration: 600.ms),
        ],
      ),
    );
  }

  Widget _buildSuccessView() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const SizedBox(height: 40),
        
        // Success icon
        Container(
          width: 120,
          height: 120,
          decoration: BoxDecoration(
            color: AppTheme.successColor.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.check_circle,
            color: AppTheme.successColor,
            size: 80,
          ),
        ).animate().scale(
          duration: 600.ms,
          curve: Curves.elasticOut,
          begin: const Offset(0.2, 0.2),
          end: const Offset(1, 1),
        ),
        
        const SizedBox(height: 40),
        
        // Success message
        Text(
          "Email Sent Successfully!",
          style: GoogleFonts.roboto(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: AppTheme.textPrimaryColor,
          ),
        ).animate().fadeIn(delay: 300.ms, duration: 600.ms),
        
        const SizedBox(height: 16),
        
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Text(
            "We've sent a password reset link to:\n${_emailController.text}",
            textAlign: TextAlign.center,
            style: GoogleFonts.roboto(
              fontSize: 16,
              color: AppTheme.textSecondaryColor,
            ),
          ),
        ).animate().fadeIn(delay: 600.ms, duration: 600.ms),
        
        const SizedBox(height: 16),
        
        Text(
          "Please check your email and follow the instructions.",
          textAlign: TextAlign.center,
          style: GoogleFonts.roboto(
            fontSize: 14,
            color: AppTheme.textSecondaryColor,
          ),
        ).animate().fadeIn(delay: 900.ms, duration: 600.ms),
        
        const SizedBox(height: 40),
        
        // Back to login button
        CustomButton(
          text: 'Back to Login',
          onPressed: () => Navigator.pop(context),
        ).animate().fadeIn(delay: 1200.ms, duration: 600.ms),
        
        const SizedBox(height: 40),
        
        // Didn't receive the email
        TextButton.icon(
          onPressed: () {
            setState(() {
              _emailSent = false;
            });
          },
          icon: const Icon(Icons.refresh, color: AppTheme.primaryColor),
          label: const Text(
            "Didn't receive the email? Try again",
            style: TextStyle(
              color: AppTheme.primaryColor,
              fontWeight: FontWeight.w500,
            ),
          ),
        ).animate().fadeIn(delay: 1500.ms, duration: 600.ms),
      ],
    );
  }
} 