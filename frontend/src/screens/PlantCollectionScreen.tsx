import React, { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Plant } from '../types/plant'
import { api } from '../api/client'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import type { RootStackParamList } from '../navigation/AppNavigator'

export function PlantCollectionScreen() {
  const [isAddingPlant, setIsAddingPlant] = useState(false)
  const [newPlantName, setNewPlantName] = useState('')
  const [newPlantType, setNewPlantType] = useState('')
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const queryClient = useQueryClient()

  const { data: plants, isLoading } = useQuery<Plant[]>({
    queryKey: ['plants'],
    queryFn: () => api.get('/plants').then(res => res.data)
  })

  const createPlantMutation = useMutation({
    mutationFn: (plant: { name: string; type: string }) =>
      api.post('/plants', plant).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] })
      setIsAddingPlant(false)
      setNewPlantName('')
      setNewPlantType('')
    }
  })

  const deletePlantMutation = useMutation({
    mutationFn: (plantId: string) =>
      api.delete(`/plants/${plantId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] })
    }
  })

  function handleAddPlant() {
    if (!newPlantName.trim() || !newPlantType.trim()) return
    createPlantMutation.mutate({ name: newPlantName, type: newPlantType })
  }

  function renderPlantItem({ item }: { item: Plant }) {
    return (
      <TouchableOpacity
        style={styles.plantItem}
        onPress={() => navigation.navigate('PlantDetail', { plantId: item.id })}
      >
        <View style={styles.plantInfo}>
          <Text style={styles.plantName}>{item.name}</Text>
          <Text style={styles.plantType}>{item.type}</Text>
        </View>
        <TouchableOpacity
          onPress={() => deletePlantMutation.mutate(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text>Loading plants...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Plants</Text>
        <TouchableOpacity
          onPress={() => setIsAddingPlant(!isAddingPlant)}
          style={styles.addButton}
        >
          <Ionicons
            name={isAddingPlant ? 'close' : 'add'}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {isAddingPlant && (
        <View style={styles.addPlantForm}>
          <TextInput
            style={styles.input}
            placeholder="Plant Name"
            value={newPlantName}
            onChangeText={setNewPlantName}
          />
          <TextInput
            style={styles.input}
            placeholder="Plant Type"
            value={newPlantType}
            onChangeText={setNewPlantType}
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleAddPlant}
          >
            <Text style={styles.submitButtonText}>Add Plant</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={plants}
        renderItem={renderPlantItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  addButton: {
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  list: {
    padding: 16
  },
  plantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12
  },
  plantInfo: {
    flex: 1
  },
  plantName: {
    fontSize: 18,
    fontWeight: '600'
  },
  plantType: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  deleteButton: {
    padding: 8
  },
  addPlantForm: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16
  }
}) 