import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lottie/lottie.dart';
import 'package:animated_text_kit/animated_text_kit.dart';
import 'dart:async';

import '../core/theme/app_theme.dart';
import '../core/constants/app_constants.dart';
import './login_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  bool _showText = false;
  bool _showTagline = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    );

    _animationController.forward();

    // Delayed animations
    Timer(const Duration(milliseconds: 1200), () {
      if (mounted) setState(() => _showText = true);
    });

    Timer(const Duration(milliseconds: 2400), () {
      if (mounted) setState(() => _showTagline = true);
    });

    // Navigate to login screen after delay
    Timer(const Duration(seconds: 4), () {
      if (mounted) {
        Navigator.pushReplacement(
          context,
          PageRouteBuilder(
            pageBuilder: (context, animation, secondaryAnimation) => const LoginScreen(),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              const begin = Offset(0.0, 1.0);
              const end = Offset.zero;
              const curve = Curves.easeInOutCubic;
              
              var tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
              var offsetAnimation = animation.drive(tween);
              
              return SlideTransition(position: offsetAnimation, child: child);
            },
            transitionDuration: const Duration(milliseconds: 800),
          ),
        );
      }
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    
    return Scaffold(
      backgroundColor: AppTheme.primaryColor,
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppTheme.primaryColor,
              AppTheme.primaryColor.withOpacity(0.8),
              const Color(0xFF234987),
            ],
          ),
        ),
        child: Stack(
          children: [
            // Background pattern - subtle grid
            Positioned.fill(
              child: Opacity(
                opacity: 0.05,
                child: Image.asset(
                  'assets/images/pattern.png',
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return const SizedBox.shrink();
                  },
                ),
              ),
            ),
            
            // Main content
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo
                  Container(
                    width: 150,
                    height: 150,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Center(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(75), // half the container width
                        child: Image.asset(
                          'assets/images/301st_logo.png', 
                          fit: BoxFit.cover,
                          width: 130,
                          height: 130,
                          errorBuilder: (context, error, stackTrace) {
                            // Fallback if logo image not found
                            return Text(
                              "301st",
                              style: GoogleFonts.robotoCondensed(
                                fontSize: 45,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.primaryColor,
                              ),
                            ).animate().scale(
                              duration: 800.ms,
                              curve: Curves.easeOutBack,
                              begin: const Offset(0.2, 0.2),
                              end: const Offset(1, 1),
                            );
                          },
                        ),
                      ),
                    ),
                  ).animate().fade(duration: 800.ms),
                  
                  const SizedBox(height: 40),
                  
                  // App name
                  if (_showText)
                    AnimatedTextKit(
                      animatedTexts: [
                        TypewriterAnimatedText(
                          '301st READY RESERVE INFANTRY BATTALION',
                          textStyle: GoogleFonts.robotoCondensed(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            letterSpacing: 1.2,
                          ),
                          speed: const Duration(milliseconds: 80),
                        ),
                      ],
                      totalRepeatCount: 1,
                      displayFullTextOnTap: true,
                    ),
                  
                  const SizedBox(height: 12),
                  
                  // Tagline
                  if (_showTagline)
                    Text(
                      "Personnel Management System",
                      style: GoogleFonts.roboto(
                        fontSize: 16,
                        color: Colors.white.withOpacity(0.8),
                      ),
                    ).animate().fadeIn(
                      duration: 800.ms,
                    ).slideY(
                      begin: 20,
                      end: 0,
                      curve: Curves.easeOutQuad,
                      duration: 800.ms,
                    ),
                ],
              ),
            ),
            
            // Loading indicator
            Positioned(
              bottom: 80,
              left: 0,
              right: 0,
              child: Center(
                child: Column(
                  children: [
                    SizedBox(
                      width: 40,
                      height: 40,
                      child: CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white.withOpacity(0.9)),
                        strokeWidth: 3,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      "Loading...",
                      style: GoogleFonts.roboto(
                        fontSize: 14,
                        color: Colors.white.withOpacity(0.7),
                      ),
                    ),
                  ],
                ).animate().fadeIn(
                  delay: 600.ms,
                  duration: 800.ms,
                ),
              ),
            ),
            
            // Version
            Positioned(
              bottom: 24,
              left: 0,
              right: 0,
              child: Center(
                child: Text(
                  "Version ${AppConstants.appVersion}",
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.5),
                    fontSize: 12,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
} 