export type User = {
  id: string
  email: string
  name: string
  department: string
  student_id: string
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at'>
        Update: Partial<Omit<User, 'id' | 'created_at'>>
      }
    }
  }
} 