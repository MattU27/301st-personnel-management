import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Personnel, { PersonnelStatus } from '@/models/Personnel';
import Company from '@/models/Company';
import Document, { DocumentStatus } from '@/models/Document';
import Training, { TrainingStatus } from '@/models/Training';
import { validateToken } from '@/lib/auth';
import mongoose from 'mongoose';

// Define route segment config
export const dynamic = 'force-dynamic';
export const revalidate = 0; // This means do not cache
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Validate user token
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication token is required' }, { status: 401 });
    }
    
    const decoded = await validateToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }
    
    // Fetch the user to check their role
    const user = await Personnel.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    
    // Only allow director to access analytics
    if (user.role !== 'director') {
      return NextResponse.json({ 
        success: false, 
        message: 'Access denied. Only directors can access analytics data.' 
      }, { status: 403 });
    }
    
    // 1. Analyze Training Data for Companies
    const companies = await Company.find().select('_id name readinessScore trainingsComplete').lean();
    
    // Get companies with lower than average training completion
    const avgTrainingCompletion = companies.reduce((sum, company) => sum + company.trainingsComplete, 0) / companies.length;
    
    // Calculate potential improvements for companies below average
    const trainingRecommendations = companies
      .filter(company => company.trainingsComplete < avgTrainingCompletion)
      .map(company => {
        // Calculate potential improvement as half the gap to the average
        const potentialImprovement = Math.round((avgTrainingCompletion - company.trainingsComplete) / 2);
        // Calculate projected readiness increase (about 1% for every 3% training improvement)
        const readinessImprovement = Math.round(potentialImprovement / 3);
        
        return {
          company: company.name,
          currentTrainingCompletion: company.trainingsComplete,
          potentialImprovement,
          currentReadiness: company.readinessScore,
          projectedReadiness: company.readinessScore + readinessImprovement
        };
      })
      .sort((a, b) => b.potentialImprovement - a.potentialImprovement)
      .slice(0, 3); // Get top 3 with highest potential improvement
    
    // 2. Analyze Personnel Distribution
    const personnelByCompany = await Personnel.aggregate([
      { $match: { status: PersonnelStatus.ACTIVE } },
      { $group: {
        _id: "$company",
        currentCount: { $sum: 1 }
      }},
      { $lookup: {
        from: "companies",
        localField: "_id",
        foreignField: "_id",
        as: "companyInfo"
      }},
      { $unwind: "$companyInfo" },
      { $project: {
        _id: 0,
        company: "$companyInfo.name",
        currentCount: 1
      }}
    ]);
    
    // Calculate average personnel per company
    const avgPersonnelCount = personnelByCompany.reduce((sum, item) => sum + item.currentCount, 0) / personnelByCompany.length;
    
    // Find companies with significant deviations from average
    const personnelImbalances = personnelByCompany.map(item => {
      const deviation = Math.round(item.currentCount - avgPersonnelCount);
      return {
        company: item.company,
        currentCount: item.currentCount,
        deviation,
        recommendation: deviation > 10 
          ? `Consider reassigning ${Math.floor(deviation/2)} personnel to understaffed companies`
          : deviation < -10 
            ? `Consider adding ${Math.abs(Math.floor(deviation/2))} personnel from overstaffed companies`
            : 'Personnel distribution is within acceptable range'
      };
    })
    .filter(item => Math.abs(item.deviation) > 10)
    .sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
    
    // 3. Analyze Document Verification Backlog
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // Current document backlog by company
    const currentDocumentBacklog = await Document.aggregate([
      { $match: { status: DocumentStatus.PENDING } },
      { $lookup: {
        from: "personnels",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo"
      }},
      { $unwind: "$userInfo" },
      { $lookup: {
        from: "companies",
        localField: "userInfo.company",
        foreignField: "_id",
        as: "companyInfo"
      }},
      { $unwind: { path: "$companyInfo", preserveNullAndEmptyArrays: true } },
      { $group: {
        _id: "$userInfo.company",
        company: { $first: "$companyInfo.name" },
        count: { $sum: 1 },
        oldestPending: { $min: "$createdAt" }
      }},
      { $sort: { count: -1 } },
      { $limit: 3 },
      { $project: {
        _id: 0,
        company: 1,
        count: 1,
        oldestPendingDate: "$oldestPending"
      }}
    ]);
    
    // Document backlog growth rate (comparing with documents from a month ago)
    const previousMonthDocuments = await Document.countDocuments({ 
      status: DocumentStatus.PENDING,
      createdAt: { $lt: oneMonthAgo }
    });
    
    const currentPendingDocuments = await Document.countDocuments({ 
      status: DocumentStatus.PENDING 
    });
    
    // Calculate growth rate (if previous month had documents)
    const growthRate = previousMonthDocuments > 0
      ? Math.round(((currentPendingDocuments - previousMonthDocuments) / previousMonthDocuments) * 100)
      : (currentPendingDocuments > 0 ? 100 : 0); // If no previous documents but we have current ones, that's 100% growth
    
    // Build response data
    const companyWithHighestPotential = trainingRecommendations.length > 0 
      ? trainingRecommendations[0] 
      : null;
    
    const largestImbalance = personnelImbalances.length > 0
      ? personnelImbalances[0]
      : null;
    
    const highestBacklog = currentDocumentBacklog.length > 0
      ? currentDocumentBacklog[0]
      : null;
    
    // Create overall suggestions
    const trainingOverallSuggestion = companyWithHighestPotential 
      ? `Increasing training frequency for ${companyWithHighestPotential.company} could improve their readiness score by an estimated ${companyWithHighestPotential.potentialImprovement}%. Current completion rate is below target at ${companyWithHighestPotential.currentTrainingCompletion}%.`
      : "All companies are meeting or exceeding the average training completion rates.";
    
    const resourceAllocationSuggestion = largestImbalance 
      ? `Rebalancing personnel distribution could optimize resource utilization. Consider reassigning ${Math.abs(Math.floor(largestImbalance.deviation/2))} personnel ${largestImbalance.deviation > 0 ? 'from' : 'to'} ${largestImbalance.company}.`
      : "Personnel distribution across companies is relatively balanced.";
    
    const documentBacklogSuggestion = highestBacklog 
      ? `Document verification backlog in ${highestBacklog.company} has ${growthRate > 0 ? 'increased' : 'decreased'} by ${Math.abs(growthRate)}% this month. ${growthRate > 0 ? 'Allocating additional verification resources could prevent compliance issues.' : 'Continue the current verification process to maintain this positive trend.'}`
      : "No significant document verification backlog detected.";
    
    const responseData = {
      trainingRecommendations: {
        companies: trainingRecommendations,
        overallSuggestion: trainingOverallSuggestion
      },
      resourceAllocation: {
        imbalances: personnelImbalances,
        suggestion: resourceAllocationSuggestion
      },
      documentVerification: {
        backlog: currentDocumentBacklog,
        growthRate,
        suggestion: documentBacklogSuggestion
      }
    };
    
    return NextResponse.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error in prescriptive analytics API:', error);
    return NextResponse.json({ 
      success: false,  
      message: 'Failed to generate prescriptive analytics', 
      error: (error as Error).message 
    }, { status: 500 });
  }
} 