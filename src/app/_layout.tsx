// app/_layout.tsx
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';

export default function Layout() {
  return (
    <SQLiteProvider databaseName="clientes.db">
      <Stack />
    </SQLiteProvider>
  );
}
