"use client";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import Navigation from '../../../components/Navigation';
import { useRouter } from 'next/navigation';

export default function CreateQuestionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Validation schema for question creation
  const schema = yup.object({
    positiveOutcome: yup.string()
      .required("Positive outcome is required")
      .min(5, "Please provide more detail (at least 5 characters)")
      .max(200, "Keep it concise (max 200 characters)"),
    negativeOutcome: yup.string()
      .required("Negative outcome is required")
      .min(5, "Please provide more detail (at least 5 characters)")
      .max(200, "Keep it concise (max 200 characters)"),
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
        minHeight: 'calc(100vh - 60px)',
        padding: '20px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '500px',
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
            marginBottom: '10px',
            background: 'linear-gradient(135deg, #e91e63, #9c27b0, #ff9800)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            width: '100%'
          }}>
            Create Button Dilemma
          </h1>

          <p style={{
            textAlign: 'center',
            color: '#666',
            marginBottom: '30px',
            fontSize: '1.1rem'
          }}>
            Create a moral dilemma: What good and bad things happen if someone presses the button?
          </p>

          <form onSubmit={handleSubmit(async (data) => {
            setIsLoading(true);
            try {
              // TODO: Replace with real API call
              console.log('Creating question:', data);

              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 1000));

              // Navigate back to profile or questions list
              router.push('/users/profile');
            } catch (error) {
              console.error('Failed to create question:', error);
            } finally {
              setIsLoading(false);
            }
          })} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '25px',
            width: '100%',
            alignItems: 'center'
          }}>

            <div style={{ width: '100%' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#2d3748'
              }}>
                ✅ Good thing that happens:
              </label>
              <Input
                label=""
                type="text"
                placeholder="You will be rich and famous"
                error={errors.positiveOutcome as import('react-hook-form').FieldError | undefined}
                {...register("positiveOutcome")}
                style={{
                  fontSize: '16px',
                  padding: '15px',
                  minHeight: '50px'
                }}
              />
            </div>

            <div style={{ width: '100%' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#2d3748'
              }}>
                ❌ Bad thing that happens:
              </label>
              <Input
                label=""
                type="text"
                placeholder="You lose all your family members"
                error={errors.negativeOutcome as import('react-hook-form').FieldError | undefined}
                {...register("negativeOutcome")}
                style={{
                  fontSize: '16px',
                  padding: '15px',
                  minHeight: '50px'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '15px',
              width: '100%',
              marginTop: '10px'
            }}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                style={{ flex: 1 }}
              >
                Create Question
              </Button>
            </div>
          </form>

          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: 'rgba(233, 30, 99, 0.1)',
            borderRadius: '10px',
            fontSize: '0.9rem',
            color: '#666',
            textAlign: 'center'
          }}>
            <strong>💡 Tip:</strong> The best questions create tough moral dilemmas.
            Make the positive outcome tempting and the negative outcome genuinely concerning!
          </div>
        </div>
      </div>
    </div>
  );
}
