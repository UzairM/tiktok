import axios from 'axios';
import { MediaItem } from '../../types/media';
import { config } from '../../config/env';

export class AIService {
  private readonly GPT4O_API_KEY = config.GPT4O_API_KEY;

  async analyzeImage(imageUrl: string): Promise<MediaItem['aiResult']> {
    try {
      // Get health analysis
      const healthAnalysis = await this.analyzeHealth(imageUrl);
      
      // Get growth analysis
      const growthAnalysis = await this.analyzeGrowth(imageUrl);

      // Return raw responses
      return {
        healthAnalysis: healthAnalysis.content,
        growthAnalysis: growthAnalysis.content
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  }

  async aggregateVideoAnalyses(results: Array<MediaItem['aiResult']>): Promise<MediaItem['aiResult']> {
    if (!results.length) return {};

    try {
      // Format all frame analyses into a structured text
      const analysisText = results.map((result, index) => {
        if (!result) return '';
        return `Frame ${index + 1}:\n` +
               `Health Analysis:\n${result.healthAnalysis || 'No health analysis'}\n\n` +
               `Growth Analysis:\n${result.growthAnalysis || 'No growth analysis'}\n` +
               '-------------------';
      }).join('\n\n');

      const response = await axios.post<{
        choices: Array<{
          message: {
            content: string;
          };
        }>;
      }>(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: `You are an AI model designed to aggregate multiple frame analyses of a plant video into a single comprehensive analysis. Below are the individual frame analyses. Please provide a consolidated summary that captures the key insights across all frames. Maintain the same format as individual analyses but make it a cohesive summary.\n\n${analysisText}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.GPT4O_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const aggregatedContent = response.data.choices[0].message.content;
      console.log('Aggregated Analysis Response:', {
        timestamp: new Date().toISOString(),
        frameCount: results.length,
        rawResponse: aggregatedContent
      });

      // Split the aggregated content into health and growth sections
      const healthMatch = aggregatedContent.match(/Health Analysis:([\s\S]*?)(?=Growth Analysis:|$)/i);
      const growthMatch = aggregatedContent.match(/Growth Analysis:([\s\S]*?)$/i);

      return {
        healthAnalysis: healthMatch ? healthMatch[1].trim() : undefined,
        growthAnalysis: growthMatch ? growthMatch[1].trim() : undefined
      };

    } catch (error) {
      console.error('Error aggregating video analyses:', error);
      // Return the first frame's analysis as fallback
      return results[0] || {};
    }
  }

  private async analyzeHealth(imageUrl: string): Promise<{ content: string }> {
    try {
      const response = await axios.post<{
        choices: Array<{
          message: {
            content: string;
          };
        }>;
      }>(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "You are an AI model designed to analyze plant health. Analyze the attached plant photo. Identify any diseases, pests, or nutritional issues. Include step-by-step instructions to fix the problem. If I need to buy anything, list specific product brands (fertilizers, fungicides, pesticides, etc.) along with their amazon links. Also give me a rough timeline for how long it should take for the plant to recover and any extra tips on care. If the plant is healthy, just say so. Dont give me a timeline if the plant is healthy. Also dont say that you are unable to analyze the image."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageUrl,
                    detail: "high"
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.GPT4O_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0].message.content;
      console.log('Health Analysis Response:', {
        timestamp: new Date().toISOString(),
        imageUrl,
        rawResponse: content
      });
      
      return { content };
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number; data: any } };
        console.error('OpenAI API Error (Health Analysis):', {
          status: axiosError.response?.status,
          data: axiosError.response?.data
        });
      }
      throw error;
    }
  }

  private async analyzeGrowth(imageUrl: string): Promise<{ content: string }> {
    try {
      const response = await axios.post<{
        choices: Array<{
          message: {
            content: string;
          };
        }>;
      }>(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "You are an AI model designed to analyze plant growth metrics. Please analyze the attached media and extract the following growth-related data:\n1. Leaf Count: Count the number of visible leaves.\n2. Plant Height: Estimate the height in centimeters if a reference scale is visible.\nProvide the results in a clear, structured format."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageUrl,
                    detail: "high"
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.GPT4O_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0].message.content;
      console.log('Growth Analysis Response:', {
        timestamp: new Date().toISOString(),
        imageUrl,
        rawResponse: content
      });
      
      return { content };
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number; data: any } };
        console.error('OpenAI API Error (Growth Analysis):', {
          status: axiosError.response?.status,
          data: axiosError.response?.data
        });
      }
      throw error;
    }
  }

  async analyzeGrowthProgression(imageUrls: string[], prompt: string): Promise<string> {
    try {
      const response = await axios.post<{
        choices: Array<{
          message: {
            content: string;
          };
        }>;
      }>(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt
                },
                ...imageUrls.map(url => ({
                  type: "image_url",
                  image_url: {
                    url,
                    detail: "high"
                  }
                }))
              ]
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.GPT4O_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0].message.content;
      console.log('Growth Progression Analysis Response:', {
        timestamp: new Date().toISOString(),
        imageCount: imageUrls.length,
        rawResponse: content
      });
      
      return content;
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number; data: any } };
        console.error('OpenAI API Error (Growth Progression):', {
          status: axiosError.response?.status,
          data: axiosError.response?.data
        });
      }
      throw error;
    }
  }
} 