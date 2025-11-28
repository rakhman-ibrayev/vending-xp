import { useMachine } from '@/entities/machines/use-machine'
import { StyleSheet, Text, View } from 'react-native'

const SupportContacts = () => {
  const machineQuery = useMachine()
  const machineData = machineQuery.data?.data.data

  if (!machineData?.support_contacts) {
    return null
  }

  return (
    <View style={styles.supportContact}>
      <Text style={styles.supportContactText}>Служба поддержки:</Text>

      <Text style={styles.supportContactText}>
        {machineData.support_contacts}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  supportContact: {
    paddingInline: 18,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16
  },
  supportContactText: {
    fontSize: 16,
    color: '#888888'
  }
})

export { SupportContacts }
