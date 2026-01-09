const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Analyze content with AI
exports.analyzeContent = async (postData) => {
  try {
    const prompt = `Analyze this social media post for ${postData.platform}:

Title: ${postData.title}
Description: ${postData.description || 'N/A'}
Content Type: ${postData.contentType}
Hashtags: ${postData.hashtags?.join(', ') || 'N/A'}

Provide analysis in JSON format with:
1. sentiment (positive/neutral/negative)
2. topics (array of 3-5 relevant topics)
3. suggestedImprovements (array of 3-5 specific improvement suggestions)
4. predictedPerformance (low/medium/high/viral)
5. bestPostingTime (suggest optimal time based on content type and platform)

Be concise and actionable. Focus on Gen Z engagement trends.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert social media analyst specializing in Gen Z content trends and viral content prediction. Provide analysis in valid JSON format only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const analysis = JSON.parse(completion.choices[0].message.content);
    analysis.analyzedAt = new Date();

    return analysis;
  } catch (error) {
    console.error('AI analysis error:', error);
    throw new Error('Failed to analyze content');
  }
};

// Get trending topics and recommendations
exports.getTrendingInsights = async (userPosts) => {
  try {
    // Prepare data summary
    const postsData = userPosts.slice(0, 10).map(post => ({
      platform: post.platform,
      contentType: post.contentType,
      engagement: post.metrics.engagementRate,
      hashtags: post.hashtags,
      publishedHour: new Date(post.publishedAt).getHours(),
      publishedDay: new Date(post.publishedAt).getDay()
    }));

    const prompt = `Based on this user's recent post performance data:
${JSON.stringify(postsData, null, 2)}

Provide Gen Z content recommendations in JSON format:
1. trendingTopics (array of 5 trending topics for Gen Z in 2026)
2. contentSuggestions (array of 5 specific content ideas)
3. optimalPostingTimes (array of 3 best times with day and hour)
4. hashtagRecommendations (array of 10 trending hashtags)
5. platformAdvice (object with advice for each platform they use)

Focus on viral trends, authenticity, and Gen Z preferences.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a Gen Z social media trend expert. Provide data-driven recommendations in valid JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 800
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Trending insights error:', error);
    throw new Error('Failed to get trending insights');
  }
};

// Predict optimal posting time based on historical data
exports.predictOptimalPostingTime = async (userPosts) => {
  try {
    // Calculate engagement by time slots
    const timeSlotEngagement = {};

    userPosts.forEach(post => {
      const hour = new Date(post.publishedAt).getHours();
      const day = new Date(post.publishedAt).getDay();
      const key = `${day}-${hour}`;

      if (!timeSlotEngagement[key]) {
        timeSlotEngagement[key] = { totalEngagement: 0, count: 0 };
      }

      timeSlotEngagement[key].totalEngagement += parseFloat(post.metrics.engagementRate) || 0;
      timeSlotEngagement[key].count++;
    });

    // Calculate average engagement per time slot
    const avgEngagementByTime = Object.entries(timeSlotEngagement).map(([key, data]) => {
      const [day, hour] = key.split('-').map(Number);
      return {
        day,
        hour,
        avgEngagement: (data.totalEngagement / data.count).toFixed(2),
        count: data.count
      };
    });

    // Sort by engagement and get top 5
    const topTimes = avgEngagementByTime
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 5);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return topTimes.map(time => ({
      day: dayNames[time.day],
      hour: time.hour,
      displayTime: `${time.hour}:00`,
      avgEngagement: time.avgEngagement,
      sampleSize: time.count
    }));
  } catch (error) {
    console.error('Optimal posting time error:', error);
    throw new Error('Failed to predict optimal posting time');
  }
};

// Generate content performance report
exports.generatePerformanceReport = async (analytics) => {
  try {
    const prompt = `Generate a concise performance report based on this analytics data:

Total Posts: ${analytics.totalPosts}
Total Views: ${analytics.totalViews}
Average Engagement Rate: ${analytics.avgEngagementRate}%
Top Platform: ${analytics.topPerformingPlatform || 'N/A'}

Provide in JSON format:
1. summary (2-3 sentence overview)
2. strengths (array of 3 positive highlights)
3. improvements (array of 3 actionable improvement areas)
4. nextSteps (array of 3 specific actions to take)

Keep it encouraging and actionable for Gen Z creators.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a supportive social media coach for Gen Z creators. Be encouraging but honest.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 400
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Performance report error:', error);
    throw new Error('Failed to generate performance report');
  }
};
