import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { formSchema } from '@/lib/schema';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface EnterDataUIProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  isLoading: boolean;
  capturedFrames: string[];
}

const EnterDataUI = ({
  form,
  onSubmit,
  isLoading,
  capturedFrames,
}: EnterDataUIProps) => {
  const [requiredFields, setRequiredFields] = useState(false);

  useEffect(() => {
    const firstName = form.watch('firstName');
    const lastName = form.watch('lastName');

    setRequiredFields(!!firstName && !!lastName);
  }, [form.watch('firstName'), form.watch('lastName')]);

  return (
    <div className="flex flex-col justify-center w-full mx-auto gap-4">
      <div className="flex flex-row items-center w-full mx-auto gap-3">
        <div
          className={cn(
            'w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-sm font-medium transition-colors duration-200 bg-neutral-300 text-neutral-500',
            requiredFields &&
              'ring-2 ring-offset-2 ring-green-500 text-white bg-green-500'
          )}
        >
          {requiredFields ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            '2'
          )}
        </div>
        <span className="text-sm font-medium text-neutral-500">
          {requiredFields
            ? 'All set. Feel free to add more details.'
            : 'Enter both your first and last name to continue'}
        </span>
      </div>

      {/* Form Section */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            {/* Personal Information Group */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="ID" {...field} />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500 ml-1 mt-1" />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="First Name *" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="Last Name *" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Age"
                          {...field}
                          value={field.value || ''} // Add this line to handle empty state
                          onChange={(e) => {
                            const value = e.target.value
                              ? Number(e.target.value)
                              : 0;
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value || ''} // Add this line to ensure controlled behavior
                      >
                        <FormControl>
                          <SelectTrigger className="text-neutral-500">
                            <SelectValue placeholder="Gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Contact Information Group */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Phone"
                        {...field}
                        className=" px-4 rounded-xl bg-white border-neutral-200 
                                   focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                                   transition-all duration-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={
                isLoading || capturedFrames.length === 0 || !requiredFields
              }
              className="w-full h-12 rounded-xl text-white font-medium 
                         bg-green-500 hover:bg-green-600 active:bg-green-700
                         disabled:bg-neutral-400 disabled:cursor-not-allowed
                         transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3 animate-pulse">
                  <div className="animate-spin rounded-full h-6 w-6 border-y-2 border-black" />
                  Enrolling
                </div>
              ) : (
                'Complete Enrollment'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EnterDataUI;
