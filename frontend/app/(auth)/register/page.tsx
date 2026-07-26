import RegisterForm from '@/components/forms/RegisterForm'
import AuthCard from '@/components/ui/AuthCard'


function register() {
  return (
    <AuthCard
      title='Create Account'
      subtitle="Create your Health Copilot account to start your healthy journey"
    >
      <RegisterForm/>
    </AuthCard>
  )
}

export default register