import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Modal, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Card, Chip, Portal, Dialog, Paragraph, IconButton, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../api/ApiService';

// Pizza menu options and prices - same as in the web app
const PIZZA_MENU = {
  'Margie': { price: 149 },
  'Champ': { price: 179 },
  'Pig n Paradise': { price: 169 },
  'Vegan Harvest': { price: 189 },
  'Mish-Mash': { price: 192 },
  'Mushroom Cloud': { price: 174 },
  'Feisty Italian': { price: 179 },
  'Sausage Party': { price: 179 },
  'Zesty Zucchini': { price: 149 },
  'Spud': { price: 149 },
  'Owen': { price: 169 },
  'Build Your Own': { price: 159 },
  "Lekker'izza Pizza": { price: 194 },
  "Poppa's Pizza": { price: 179 },
  'Sunshine Margherita': { price: 149 },
  'Chick Tick Boom': { price: 172 },
  'Ham & Artichoke': { price: 172 },
  'Veg Special': { price: 169 },
  "Jane's Dough": { price: 109 }
};

// Platform/delivery service options
const PLATFORM_OPTIONS = [
  'Window', 
  'Uber Eats', 
  'Mr D Food', 
  'Bolt Food', 
  'Customer Pickup', 
  'Other'
];

const NewOrderScreen = ({ navigation }) => {
  // State for order form
  const [selectedPizzas, setSelectedPizzas] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [platform, setPlatform] = useState('Window');
  const [customPlatform, setCustomPlatform] = useState('');
  const [prepTime, setPrepTime] = useState('15');
  const [extraToppings, setExtraToppings] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Modals state
  const [showPizzaSelector, setShowPizzaSelector] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [editingPizzaIndex, setEditingPizzaIndex] = useState(null);
  const [pizzaInstructions, setPizzaInstructions] = useState('');
  const [platformSelectorVisible, setPlatformSelectorVisible] = useState(false);

  // Calculate total price
  const calculateTotal = () => {
    return selectedPizzas.reduce((total, pizza) => {
      const price = PIZZA_MENU[pizza.type]?.price || 0;
      return total + (price * pizza.quantity);
    }, 0);
  };

  // Handle adding a pizza to the order
  const handleAddPizza = (type) => {
    const price = PIZZA_MENU[type]?.price || 0;
    
    setSelectedPizzas([
      ...selectedPizzas,
      {
        type,
        quantity: 1,
        totalPrice: price,
        specialInstructions: ''
      }
    ]);
    
    setShowPizzaSelector(false);
  };

  // Handle removing a pizza from the order
  const handleRemovePizza = (index) => {
    const newPizzas = [...selectedPizzas];
    newPizzas.splice(index, 1);
    setSelectedPizzas(newPizzas);
  };

  // Handle updating pizza quantity
  const handleUpdateQuantity = (index, newQuantity) => {
    const quantity = parseInt(newQuantity) || 1;
    if (quantity < 1) return;
    
    const newPizzas = [...selectedPizzas];
    const pizza = newPizzas[index];
    const price = PIZZA_MENU[pizza.type]?.price || 0;
    
    newPizzas[index] = {
      ...pizza,
      quantity,
      totalPrice: price * quantity
    };
    
    setSelectedPizzas(newPizzas);
  };

  // Open instructions modal for a pizza
  const openInstructionsModal = (index) => {
    setEditingPizzaIndex(index);
    setPizzaInstructions(selectedPizzas[index].specialInstructions || '');
    setShowInstructionsModal(true);
  };

  // Save special instructions for a pizza
  const saveInstructions = () => {
    if (editingPizzaIndex === null) return;
    
    const newPizzas = [...selectedPizzas];
    newPizzas[editingPizzaIndex] = {
      ...newPizzas[editingPizzaIndex],
      specialInstructions: pizzaInstructions
    };
    
    setSelectedPizzas(newPizzas);
    setShowInstructionsModal(false);
    setEditingPizzaIndex(null);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validation
      if (selectedPizzas.length === 0) {
        Alert.alert('Error', 'Please add at least one pizza to the order.');
        return;
      }
      
      if (platform === 'Other' && !customPlatform.trim()) {
        Alert.alert('Error', 'Please specify the custom platform.');
        return;
      }
      
      if (!prepTime || parseInt(prepTime) < 1) {
        Alert.alert('Error', 'Please enter a valid preparation time.');
        return;
      }
      
      // Create order object
      const orderData = {
        id: Date.now(),
        pizzas: selectedPizzas.map(pizza => ({
          pizzaType: pizza.type,
          quantity: pizza.quantity,
          totalPrice: pizza.totalPrice,
          specialInstructions: pizza.specialInstructions,
          notes: pizza.specialInstructions // For compatibility with existing code
        })),
        orderTime: new Date().toISOString(),
        status: 'pending',
        platform: platform === 'Other' ? customPlatform : platform,
        customerName: customerName.trim() || undefined,
        prepTime: parseInt(prepTime) || 15,
        extraToppings: extraToppings.trim() || undefined,
        urgency: parseInt(prepTime) <= 15 ? 'high' : parseInt(prepTime) <= 30 ? 'medium' : 'low',
        totalAmount: calculateTotal(),
        cooked: selectedPizzas.map(() => false) // Initialize all pizzas as not cooked
      };
      
      setLoading(true);
      
      // Submit order to API
      const result = await ApiService.createOrder(orderData);
      
      if (result.error) {
        Alert.alert('Error', result.message);
      } else {
        Alert.alert(
          'Success', 
          'Order created successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert('Error', 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Select platform from list
  const selectPlatform = (selected) => {
    setPlatform(selected);
    setPlatformSelectorVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          
          <TextInput
            label="Customer Name"
            value={customerName}
            onChangeText={setCustomerName}
            style={styles.input}
            mode="outlined"
          />
          
          <View style={styles.platformSelector}>
            <Text style={styles.label}>Delivery Platform</Text>
            <TouchableOpacity 
              style={styles.platformButton} 
              onPress={() => setPlatformSelectorVisible(true)}
            >
              <Text style={styles.platformButtonText}>
                {platform === 'Other' ? customPlatform || 'Select Platform' : platform}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            
            {platform === 'Other' && (
              <TextInput
                label="Specify Platform"
                value={customPlatform}
                onChangeText={setCustomPlatform}
                style={styles.input}
                mode="outlined"
              />
            )}
          </View>
          
          <TextInput
            label="Preparation Time (minutes)"
            value={prepTime}
            onChangeText={setPrepTime}
            keyboardType="number-pad"
            style={styles.input}
            mode="outlined"
          />
          
          <Divider style={styles.divider} />
          
          <View style={styles.pizzaSection}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            
            {selectedPizzas.map((pizza, index) => {
              const hasInstructions = pizza.specialInstructions?.length > 0;
              
              return (
                <View key={index} style={styles.pizzaItem}>
                  <View style={styles.pizzaDetails}>
                    <View style={styles.pizzaRow}>
                      <View style={styles.pizzaInfo}>
                        <Text style={styles.pizzaName}>{pizza.type}</Text>
                        <Text style={styles.pizzaPrice}>R{pizza.totalPrice}</Text>
                      </View>
                      
                      <View style={styles.quantityControl}>
                        <IconButton
                          icon="minus"
                          size={16}
                          onPress={() => handleUpdateQuantity(index, pizza.quantity - 1)}
                          disabled={pizza.quantity <= 1}
                        />
                        <Text style={styles.quantityText}>{pizza.quantity}</Text>
                        <IconButton
                          icon="plus"
                          size={16}
                          onPress={() => handleUpdateQuantity(index, pizza.quantity + 1)}
                        />
                      </View>
                      
                      <IconButton
                        icon="trash-outline"
                        size={20}
                        color="#F44336"
                        onPress={() => handleRemovePizza(index)}
                      />
                    </View>
                    
                    <View style={styles.instructionsRow}>
                      <Button
                        mode={hasInstructions ? "contained" : "outlined"}
                        onPress={() => openInstructionsModal(index)}
                        compact
                        style={[
                          styles.instructionsButton,
                          hasInstructions && styles.activeInstructionsButton
                        ]}
                        labelStyle={hasInstructions ? styles.activeInstructionsLabel : {}}
                        icon="pencil"
                      >
                        {hasInstructions ? "Instructions Added" : "Add Instructions"}
                      </Button>
                      
                      {hasInstructions && (
                        <Text style={styles.instructionsPreview} numberOfLines={1}>
                          {pizza.specialInstructions}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
            
            <Button
              mode="outlined"
              onPress={() => setShowPizzaSelector(true)}
              icon="plus"
              style={styles.addPizzaButton}
            >
              Add Pizza
            </Button>
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          <TextInput
            label="Extra Toppings/Special Notes"
            value={extraToppings}
            onChangeText={setExtraToppings}
            style={styles.input}
            multiline
            numberOfLines={3}
            mode="outlined"
          />
          
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Order Total:</Text>
            <Text style={styles.totalAmount}>R{calculateTotal()}</Text>
          </View>
        </Card.Content>
      </Card>
      
      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
          labelStyle={styles.submitButtonLabel}
        >
          Place Order
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          disabled={loading}
          style={styles.cancelButton}
        >
          Cancel
        </Button>
      </View>
      
      {/* Pizza Selection Modal */}
      <Portal>
        <Dialog visible={showPizzaSelector} onDismiss={() => setShowPizzaSelector(false)}>
          <Dialog.Title>Select Pizza</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 400 }}>
            <ScrollView>
              <View style={styles.pizzaOptions}>
                {Object.keys(PIZZA_MENU).map((type) => (
                  <Button
                    key={type}
                    mode="outlined"
                    onPress={() => handleAddPizza(type)}
                    style={styles.pizzaOption}
                  >
                    {type} - R{PIZZA_MENU[type].price}
                  </Button>
                ))}
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowPizzaSelector(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Special Instructions Modal */}
      <Portal>
        <Dialog visible={showInstructionsModal} onDismiss={() => setShowInstructionsModal(false)}>
          <Dialog.Title>
            {editingPizzaIndex !== null && selectedPizzas[editingPizzaIndex] ? 
              `Special Instructions for ${selectedPizzas[editingPizzaIndex].type}` : 
              'Special Instructions'}
          </Dialog.Title>
          <Dialog.Content>
            <Paragraph style={styles.instructionsHelper}>
              Enter any special instructions for this pizza (e.g., no onions, extra cheese, half-and-half toppings)
            </Paragraph>
            <TextInput
              value={pizzaInstructions}
              onChangeText={setPizzaInstructions}
              multiline
              numberOfLines={4}
              mode="outlined"
              placeholder="e.g., No onions, extra cheese, etc."
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowInstructionsModal(false)}>Cancel</Button>
            <Button onPress={saveInstructions}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Platform Selection Modal */}
      <Portal>
        <Dialog visible={platformSelectorVisible} onDismiss={() => setPlatformSelectorVisible(false)}>
          <Dialog.Title>Select Delivery Platform</Dialog.Title>
          <Dialog.Content>
            {PLATFORM_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.platformOption}
                onPress={() => selectPlatform(option)}
              >
                <Text style={styles.platformOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </Dialog.Content>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#e76f51',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  platformSelector: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
    color: '#666',
  },
  platformButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  platformButtonText: {
    fontSize: 16,
  },
  platformOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  platformOptionText: {
    fontSize: 16,
  },
  divider: {
    marginVertical: 16,
  },
  pizzaSection: {
    marginBottom: 16,
  },
  pizzaItem: {
    marginBottom: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  pizzaDetails: {
    flex: 1,
  },
  pizzaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pizzaInfo: {
    flex: 1,
  },
  pizzaName: {
    fontSize: 16,
    fontWeight: '500',
  },
  pizzaPrice: {
    color: '#666',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  quantityText: {
    fontSize: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  instructionsRow: {
    marginTop: 8,
  },
  instructionsButton: {
    borderRadius: 4,
  },
  activeInstructionsButton: {
    backgroundColor: 'rgba(231, 111, 81, 0.2)',
    borderColor: '#e76f51',
  },
  activeInstructionsLabel: {
    color: '#e76f51',
  },
  instructionsPreview: {
    fontSize: 12,
    color: '#e76f51',
    fontStyle: 'italic',
    marginTop: 4,
    paddingHorizontal: 8,
  },
  instructionsHelper: {
    marginBottom: 12,
    fontSize: 14,
  },
  addPizzaButton: {
    marginTop: 12,
  },
  pizzaOptions: {
    padding: 8,
  },
  pizzaOption: {
    marginBottom: 8,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e76f51',
  },
  actionsContainer: {
    marginTop: 8,
    marginBottom: 32,
  },
  submitButton: {
    marginBottom: 8,
    backgroundColor: '#e76f51',
    borderRadius: 4,
  },
  submitButtonLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    borderRadius: 4,
  },
});

export default NewOrderScreen;
