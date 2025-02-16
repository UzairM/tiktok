import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Markdown from 'react-native-markdown-display';

type Props = NativeStackScreenProps<RootStackParamList, 'GrowthAnalysis'>;

export function GrowthAnalysisScreen({ route, navigation }: Props) {
  const { plantId, plantName } = route.params;
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const queryClient = useQueryClient();

  // Query for existing growth analysis
  const { data: growthAnalysis, isLoading } = useQuery({
    queryKey: ['plantGrowth', plantId],
    queryFn: async () => {
      try {
        const res = await api.get(`/plants/${plantId}/growth`);
        return res.data;
      } catch (err: any) {
        if (err?.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
  });

  // Mutation for triggering growth analysis
  const analyzeMutation = useMutation({
    mutationFn: () => api.post(`/plants/${plantId}/analyze-growth`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plantGrowth', plantId] });
    },
  });

  function renderContent() {
    if (isLoading) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    if (!growthAnalysis) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.noDataText}>Click "Analyze Growth" to generate a growth analysis for your plant.</Text>
        </View>
      );
    }

    return (
      <View style={styles.analysisContainer}>
        <Markdown style={{
          body: styles.analysisText,
          heading1: styles.heading1,
          heading2: styles.heading2,
          paragraph: styles.paragraph,
          list: styles.list,
          listItem: styles.listItem,
        }}>
          {growthAnalysis.content}
        </Markdown>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>{plantName} Growth</Text>
        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={() => analyzeMutation.mutate()}
          disabled={analyzeMutation.isPending}
        >
          {analyzeMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.analyzeButtonText}>Analyze Growth</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
  },
  analyzeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  analyzeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  analysisContainer: {
    padding: 16,
  },
  analysisText: {
    fontSize: 16,
    color: '#333',
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  paragraph: {
    marginBottom: 12,
  },
  list: {
    marginBottom: 12,
  },
  listItem: {
    marginBottom: 8,
  },
}); 