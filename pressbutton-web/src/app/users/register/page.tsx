"use client";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import Navigation from '../../../components/Navigation';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  // isLoading state controls the loading indicator on the submit button
  const [isLoading, setIsLoading] = useState(false);
  const schema = yup.object({
    email: yup.string().required("Email is required").email("Invalid email").max(20, "Email must be at most 20 characters"),
    password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
    username: yup.string().required("Username is required").min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters"),
    passwordConfirm: yup.string().oneOf([yup.ref("password")], "Passwords must match"),
  });

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
          Register
        </h1>
        <form onSubmit={handleSubmit(async (data) => {
          setIsLoading(true);
          try {
            // TODO: Replace with real registration logic
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
            label="Username"
            type="text"
            placeholder="Username"
            textColor="#e91e63"
            error={errors.username as import('react-hook-form').FieldError | undefined}
            {...register("username")}
          />
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
            {...register("password")}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm Password"
            error={errors.passwordConfirm as import('react-hook-form').FieldError | undefined}
            {...register("passwordConfirm")}
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '25px',
              border: 'none',
              background: 'linear-gradient(135deg, #e91e63, #9c27b0, #ff9800)',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transform: isLoading ? 'scale(1)' : 'scale(1)',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
              }
            }}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
    </div>
  );
}
