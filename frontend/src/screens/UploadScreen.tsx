import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, TextInput, Alert, ActivityIndicator } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as ImagePicker from 'expo-image-picker'
import { Video, ResizeMode } from 'expo-av'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Plant } from '../types/plant'
import { api } from '../api/client'
import { Ionicons } from '@expo/vector-icons'

type MediaType = 'image' | 'video'

export function UploadScreen() {
  const [selectedMedia, setSelectedMedia] = useState<{ uri: string; type: MediaType } | null>(null)
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null)
  const [showPlantPicker, setShowPlantPicker] = useState(false)
  const [isAddingPlant, setIsAddingPlant] = useState(false)
  const [newPlantName, setNewPlantName] = useState('')
  const [newPlantType, setNewPlantType] = useState('')

  const queryClient = useQueryClient()

  const { data: plants } = useQuery<Plant[]>({
    queryKey: ['plants'],
    queryFn: () => api.get('/plants').then(res => res.data)
  })

  const uploadMutation = useMutation({
    mutationFn: async (data: { mediaUrl: string; plantId: string; type: MediaType }) => {
      // Create form data
      const formData = new FormData();
      
      // Get the file extension from the URI
      const uriParts = data.mediaUrl.split('.');
      const fileExtension = uriParts[uriParts.length - 1];

      // Create file object
      const file = {
        uri: data.mediaUrl,
        name: `media.${fileExtension}`,
        type: data.type === 'image' ? 'image/jpeg' : 'video/mp4'
      };

      // Append file and metadata
      formData.append('media', file as any);
      formData.append('plantId', data.plantId);
      formData.append('type', data.type);

      // Send multipart form data
      return api.post('/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then(res => res.data);
    },
    onSuccess: () => {
      // Invalidate media queries
      queryClient.invalidateQueries({ queryKey: ['media'] });
      
      // Reset state after successful upload
      setSelectedMedia(null);
      setSelectedPlant(null);
    },
    onError: (error) => {
      console.error('Upload failed:', error);
      Alert.alert('Error', 'Failed to upload media');
    }
  })

  const createPlantMutation = useMutation({
    mutationFn: async (plant: { name: string; type: string }) => {
      console.log('Sending plant creation request:', plant)
      const response = await api.post('/plants', plant)
      console.log('Plant creation response:', response.data)
      return response.data
    },
    onSuccess: (newPlant) => {
      console.log('Plant created successfully:', newPlant)
      queryClient.invalidateQueries({ queryKey: ['plants'] })
      setSelectedPlant(newPlant)
      setIsAddingPlant(false)
      setNewPlantName('')
      setNewPlantType('')
      setShowPlantPicker(false) // Close the modal after successful creation
    },
    onError: (error) => {
      console.error('Plant creation failed:', error)
      // Add error handling UI feedback here if needed
    }
  })

  const pickMedia = async (type: MediaType) => {
    const mediaTypes = type === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1
    })

    if (!result.canceled) {
      setSelectedMedia({
        uri: result.assets[0].uri,
        type
      })
    }
  }

  const handleUpload = async () => {
    if (!selectedMedia || !selectedPlant) return

    try {
      // Here you would normally upload to storage first
      // For now, we'll just use the local URI
      await uploadMutation.mutateAsync({
        mediaUrl: selectedMedia.uri,
        plantId: selectedPlant.id,
        type: selectedMedia.type
      })

      // Reset state after successful upload
      setSelectedMedia(null)
      setSelectedPlant(null)
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  function handleAddPlant() {
    console.log('Add plant button clicked:', { newPlantName, newPlantType })
    if (!newPlantName.trim() || !newPlantType.trim()) {
      console.log('Plant name or type is empty')
      return
    }
    createPlantMutation.mutate({ name: newPlantName, type: newPlantType })
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {selectedMedia ? (
          selectedMedia.type === 'image' ? (
            <Image source={{ uri: selectedMedia.uri }} style={styles.preview} />
          ) : (
            <Video
              source={{ uri: selectedMedia.uri }}
              style={styles.preview}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
            />
          )
        ) : (
          <View style={styles.uploadButtons}>
            <TouchableOpacity style={styles.uploadButton} onPress={() => pickMedia('image')}>
              <Ionicons name="image-outline" size={48} color="#2196F3" />
              <Text style={styles.uploadText}>Select Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadButton} onPress={() => pickMedia('video')}>
              <Ionicons name="videocam-outline" size={48} color="#2196F3" />
              <Text style={styles.uploadText}>Select Video</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.plantSelector,
            selectedPlant && styles.plantSelectorSelected
          ]}
          onPress={() => setShowPlantPicker(true)}
        >
          <Text style={styles.plantSelectorText}>
            {selectedPlant ? selectedPlant.name : 'Select Plant'}
          </Text>
          <Ionicons name="chevron-down" size={24} color="#666" />
        </TouchableOpacity>

        {selectedMedia && selectedPlant && (
          <TouchableOpacity
            style={[styles.submitButton, uploadMutation.isPending && styles.submitButtonDisabled]}
            onPress={handleUpload}
            disabled={uploadMutation.isPending}
          >
            <Text style={styles.submitButtonText}>
              {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showPlantPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPlantPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isAddingPlant ? 'Add New Plant' : 'Select Plant'}
              </Text>
              <TouchableOpacity onPress={() => {
                if (isAddingPlant) {
                  setIsAddingPlant(false)
                } else {
                  setShowPlantPicker(false)
                }
              }}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {isAddingPlant ? (
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
                  disabled={createPlantMutation.isPending}
                >
                  <Text style={styles.submitButtonText}>
                    {createPlantMutation.isPending ? 'Adding...' : 'Add Plant'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.addNewButton}
                  onPress={() => setIsAddingPlant(true)}
                >
                  <Ionicons name="add-circle-outline" size={24} color="#2196F3" />
                  <Text style={styles.addNewButtonText}>Add New Plant</Text>
                </TouchableOpacity>

                {plants?.map(plant => (
                  <TouchableOpacity
                    key={plant.id}
                    style={styles.plantOption}
                    onPress={() => {
                      setSelectedPlant(plant)
                      setShowPlantPicker(false)
                    }}
                  >
                    <Text style={styles.plantOptionName}>{plant.name}</Text>
                    <Text style={styles.plantOptionType}>{plant.type}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {uploadMutation.isPending && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Uploading media...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  preview: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 8,
    marginBottom: 16
  },
  uploadButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 16
  },
  uploadButton: {
    flex: 1,
    margin: 8,
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  uploadText: {
    marginTop: 8,
    fontSize: 16,
    color: '#2196F3'
  },
  plantSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16
  },
  plantSelectorSelected: {
    backgroundColor: '#e3f2fd'
  },
  plantSelectorText: {
    fontSize: 16,
    color: '#333'
  },
  submitButton: {
    width: '100%',
    padding: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center'
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  plantOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  plantOptionName: {
    fontSize: 16,
    fontWeight: '600'
  },
  plantOptionType: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f8f9fa'
  },
  addNewButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600'
  },
  addPlantForm: {
    padding: 16
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  submitButtonDisabled: {
    opacity: 0.7,
    backgroundColor: '#999',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
})
