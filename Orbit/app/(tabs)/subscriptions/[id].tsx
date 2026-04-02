import { View, Text } from 'react-native'
import React from 'react'
import { Link, useLocalSearchParams } from 'expo-router'

const subscriptionsDetails= () => {
    const {id}= useLocalSearchParams<{id: string}>();
  return (
    <View>
      <Text>subscriptionsDetails {id}</Text>
      <Link href="/index">Go back</Link>
    </View>
  )
}

export default subscriptionsDetails;