import LoginForm from '@/components/forms/LoginForm'
import AuthCard from '@/components/ui/AuthCard'


function login() {
  return (
    <AuthCard
    title="Welcome Back"
    subtitle="Sign in to continue your personalized health journey."
    >
      <LoginForm/>
    </AuthCard>
  )
}

export default login