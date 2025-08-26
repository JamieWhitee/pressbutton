"use client";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import Navigation from '../../../components/Navigation';
import { useRouter } from 'next/navigation';
export default function LoginPage() {
  // isLoading state controls the loading indicator on the submit button
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Yup schema for login form validation
  const schema = yup.object({
    email: yup.string().required("Email is required").email("Invalid email").max(20, "Email must be at most 20 characters"),
    password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
  });

  // useForm hook from react-hook-form
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e91e63, #9c27b0, #ff9800)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <Navigation />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 60px)', // Subtract navigation height
        padding: '20px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          padding: '40px',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '30px',
          background: 'linear-gradient(135deg, #e91e63, #9c27b0, #ff9800)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          width: '100%'
        }}>
          Login
        </h1>
        <form onSubmit={handleSubmit(async (data) => {
          setIsLoading(true);
          try {
            // TODO: Replace with real login logic
            console.log(data);
          } finally {
            setIsLoading(false);
          }
        })} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          width: '100%',
          alignItems: 'center'
        }}>
          <Input
            label="Email"
            type="email"
            placeholder="Email"
            error={errors.email as import('react-hook-form').FieldError | undefined}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Password"
            error={errors.password as import('react-hook-form').FieldError | undefined}
            autoComplete="current-password"
            {...register("password")}
          />
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            style={{ marginBottom: '10px' }}
          >
            Login
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/users/register')}
          >
            Create Account
          </Button>
        </form>
      </div>
    </div>
    </div>
  );
}
