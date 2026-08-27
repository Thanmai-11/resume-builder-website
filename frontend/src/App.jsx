import { AuthProvider, useAuth } from "./AuthContext";
import AuthScreen from "./AuthScreen";
import ResumeBuilder from "./ResumeBuilder";
import "./styles.css";

function Gate() {
  const { username } = useAuth();
  return username ? <ResumeBuilder /> : <AuthScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
