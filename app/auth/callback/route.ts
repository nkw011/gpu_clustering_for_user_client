import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    
    try {
      // Exchange the code for a session
      await supabase.auth.exchangeCodeForSession(code)

      // Get the user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      if (user && user.email) {
        // Check if user exists in our database
        const { data: userData, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single()

        if (dbError && dbError.code === 'PGRST116') {
          // User not found in database, create new user record
          const { error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.full_name || '',
                department: '',
                student_id: '',
              },
            ])

          if (insertError) throw insertError
          
          // Redirect to dashboard with profile update message
          return NextResponse.redirect(
            `${requestUrl.origin}/dashboard?message=${encodeURIComponent('Please update your profile information in the profile page.')}`
          )
        } else if (dbError) {
          throw dbError
        }

        // Redirect to dashboard
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      }
    } catch (error: any) {
      // Handle any errors
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?error=${encodeURIComponent(error.message)}`
      )
    }
  }

  // If no code or user, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/auth/login`)
} 