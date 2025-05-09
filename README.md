# Firebase Order Tracking App 📱🔥

A cross-platform mobile application (iOS and Android) for tracking orders from Firebase in real-time. Built with React Native, Expo, and Firebase.

## Features

- 📱 Cross-platform support for iOS and Android
- 🔥 Real-time order tracking using Firebase
- 🔔 Push notifications for order status updates
- 👤 User authentication and profile management
- 🛒 View complete order history
- 🚚 Track active orders with visual timeline

## Prerequisites

Before setting up the project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or newer)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Firebase account](https://firebase.google.com/) (for setting up the backend)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Firebase Setup

1. Create a new Firebase project at [firebase.google.com](https://firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Create the following collections in Firestore:
   - `orders` - For storing order information
   - `users` - For additional user data

5. Get your Firebase configuration:
   - Go to Project settings > General > Your apps
   - Create a new app if you haven't already
   - Copy the Firebase configuration object

6. Update the Firebase configuration in `/src/firebase/config.js` with your Firebase credentials

### 3. Set up the Firestore Database Structure

Each order in the `orders` collection should have this structure:

```javascript
{
  userId: "user_id",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  status: "pending", // pending, processing, shipped, delivered, cancelled
  items: [
    {
      name: "Item Name",
      price: 10.99,
      quantity: 2,
      options: ["Option 1", "Option 2"]
    }
  ],
  subtotal: 21.98,
  deliveryFee: 3.99,
  tax: 2.60,
  discount: 0,
  totalAmount: 28.57,
  paymentMethod: "Credit Card",
  deliveryDetails: {
    name: "John Doe",
    phone: "123-456-7890",
    address: "123 Main St, City, State 12345",
    instructions: "Leave at door"
  }
}
```

### 4. Run the application

```bash
npx expo start
```

In the output, you'll find options to open the app in a:

- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/client) app on your physical device

## Push Notification Setup

For push notifications to work properly:

### Android

1. Set up Firebase Cloud Messaging
2. Add your `google-services.json` file to the project
3. Configure FCM in your Expo project

### iOS

1. Set up Apple Push Notification Service (APNs)
2. Configure your Apple Developer account
3. Add push capability to your app

More detailed instructions for push notifications setup can be found in the [Expo documentation](https://docs.expo.dev/push-notifications/overview/).

## Project Structure

```
├── app/                  # Main application screens using Expo Router
│   ├── (tabs)/           # Tab-based navigation screens
│   ├── auth/             # Authentication screens
│   ├── order/            # Order detail screens
│   └── _layout.js        # Root layout configuration
├── components/           # Reusable UI components
├── src/
│   ├── context/          # React context providers
│   ├── firebase/         # Firebase configuration and services
│   └── utils/            # Utility functions
└── assets/               # Images, fonts, and other static assets
```

## Contributing

Feel free to submit issues or pull requests to improve the application.

## License

This project is licensed under the MIT License.
