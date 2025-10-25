import { Pressable, Text, type PressableProps } from 'react-native';

type ButtonProps = PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
};

export function Button({ title, variant = 'primary', className = '', ...props }: ButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-lg items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-purple-600 active:bg-purple-700',
    secondary: 'bg-gray-800 active:bg-gray-900',
    outline: 'border-2 border-purple-600 bg-transparent active:bg-purple-50',
  };

  const textClasses = {
    primary: 'text-white font-semibold text-base',
    secondary: 'text-white font-semibold text-base',
    outline: 'text-purple-600 font-semibold text-base',
  };

  return (
    <Pressable className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      <Text className={textClasses[variant]}>{title}</Text>
    </Pressable>
  );
}
