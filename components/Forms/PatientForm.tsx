"use client"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import CustomFormField from "./CustomFormField";
import SubmitBtn from "./SubmitBtn";
import { useState } from "react";
import { UserFormValidation } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { createUser } from "@/lib/actions/patient.actions";
import toast from "react-hot-toast";


export enum FormFieldTyps {
    INPUT = 'input',
    CHECKBOX = 'checkbox',
    SELECT = 'select',
    TEXTAREA = 'textarea',
    PHONNE_INPUT = 'phoneInput',
    DATE_PICKER = 'datePicker',
    SKELETON = 'skeleton'
}


const PatientForm = () => {
    const form = useForm<z.infer<typeof UserFormValidation>>({
        resolver: zodResolver(UserFormValidation),
        defaultValues: {
          name: "",
          email:'',
          phone: '',
        },
      });
      const [isLoading, setisLoading] = useState(false);
      const router = useRouter();
      // 2. Define a submit handler.
      async function onSubmit({name , email , phone}: z.infer<typeof UserFormValidation>) {
        setisLoading(true);
        try {
            const userData = {name , email , phone};
            const newUser = await createUser(userData);
            if(newUser) {
              router.push(`/patients/${newUser.$id}/register`)
            }else{
              toast.error('the phone number or email is already in use');
            };
            setisLoading(false);
        } catch (error) {
            setisLoading(false);
            console.log(error);
            
        }
      }
      return (
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <section className="mb-12 space-y-4">
                <h1 className="header">Hi there</h1>
                <p className="text-dark-700">Schedule your first appointment</p>
            </section>
            <CustomFormField
                control={form.control}
                fieldType={FormFieldTyps.INPUT}
                name="name"
                label="Full name"
                placeholder="John Doe"
                iconSrc="/assets/icons/user.svg"
                iconAlt="user"
            />
            <CustomFormField
                control={form.control}
                fieldType={FormFieldTyps.INPUT}
                name="email"
                label="Email"
                placeholder="johndoe@example.com"
                iconSrc="/assets/icons/email.svg"
                iconAlt="email"
            />
             <CustomFormField
                control={form.control}
                fieldType={FormFieldTyps.PHONNE_INPUT}
                name="phone"
                label="Phone number"
                placeholder="(01) 0125-1234"
                iconSrc="/assets/icons/phone.svg"
                iconAlt="phone"
            />
          
          <SubmitBtn isLoading={isLoading}>Get Started</SubmitBtn>
        </form>
      </Form>
      )
}

export default PatientForm;