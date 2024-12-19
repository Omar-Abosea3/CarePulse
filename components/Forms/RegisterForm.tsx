"use client"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
} from "@/components/ui/form";
import CustomFormField from "./CustomFormField";
import SubmitBtn from "./SubmitBtn";
import { useState } from "react";
import { PatientFormValidation } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { createUser, registerPatient } from "@/lib/actions/patient.actions";
import { FormFieldTyps } from "./PatientForm";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Doctors, GenderOptions, IdentificationTypes, PatientFormDefaultValues } from "@/constants";
import { Label } from "../ui/label";
import { SelectItem } from "../ui/select";
import Image from "next/image";
import FileUploader from "../FileUploader";
import toast from "react-hot-toast";



const RegisterForm = ({user}:{user:User}) => {
    const form = useForm<z.infer<typeof PatientFormValidation>>({
        resolver: zodResolver(PatientFormValidation),
        defaultValues: {
          ...PatientFormDefaultValues,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      });
      const [isLoading, setisLoading] = useState(false);
      const router = useRouter();
      // 2. Define a submit handler.
      async function onSubmit(values: z.infer<typeof PatientFormValidation>) {
        setisLoading(true);
        let formData;
        if(values.identificationDocument && values.identificationDocument.length > 0){
          const blobFile = new Blob([values.identificationDocument[0]] , {
            type: values.identificationDocument[0].type
          });
          formData = new FormData();
          formData.append("blobfile" , blobFile);
          formData.append("fileName" , values.identificationDocument[0].name);
        }
        try {
            const patientData = {
              ...values,
              userId:user.$id,
              birthDate:new Date(values.birthDate),
              identificationDocument : formData,
            }
            //@ts-ignore
            const patient = await registerPatient(patientData);
            if(patient) {
              router.push(`/patients/${user.$id}/new-appointment`)
            }else{
              toast.error('fill all form data');
            }
            setisLoading(false);
        } catch (error) {
            setisLoading(false);
            console.log(error);
        }
      }
      return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-12">
            <section className="space-y-4">
              <h1 className="header">Welcome</h1>
              <p className="text-dark-700">Let us know more about yourself.</p>
            </section>
            <section className="space-y-6">
              <div className="mb-9 space-y-1">
                <h2 className="sub-header">Personal Information.</h2>
              </div>
            </section>
            <CustomFormField
              control={form.control}
              fieldType={FormFieldTyps.INPUT}
              name="name"
              label="Full Name"
              placeholder="John Doe"
              iconSrc="/assets/icons/user.svg"
              iconAlt="user"
            />
            <div className="flex flex-col gap-6 xl:flex-row">
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
                placeholder="(01) (0125)-1234"
                iconSrc="/assets/icons/phone.svg"
                iconAlt="phone"
              />
            </div>

            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldTyps.DATE_PICKER}
                name="birthDate"
                label="Date of Birth"
                // placeholder="johndoe@example.com"
                // iconSrc="/assets/icons/email.svg"
                // iconAlt="email"
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldTyps.SKELETON}
                name="gender"
                label="Gender"
                renderSkeleton={(field:any) => (
                  <FormControl>
                    <RadioGroup
                      className="flex h-11 gap-6 xl:justify-between"
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                     {GenderOptions.map((option) => (
                      <div key={option} className="radio-group">
                        <RadioGroupItem value={option} id={option} />
                        <Label htmlFor={option} className="cursor-pointer">
                          {option}
                        </Label>
                      </div>
                     ))}
                    </RadioGroup>
                  </FormControl>
                )}
              />
            </div>
            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldTyps.INPUT}
                name="address"
                label="Address"
                placeholder="14th Street, Cairo"
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldTyps.INPUT}
                name="occupation"
                label="Occupation"
                placeholder="Software Engineer"
              /> 
            </div>
            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldTyps.INPUT}
                name="emergencyContactName"
                label="Emergency contact name"
                placeholder="Guardian’s name"
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldTyps.PHONNE_INPUT}
                name="emergencyContactNumber"
                label="Emergency contact number"
                placeholder="(01) (0125)-1234"
              />
            </div>
            <section className="space-y-6">
              <div className="mb-9 space-y-1">
                <h2 className="sub-header">Medical Information.</h2>
              </div>
            </section>
            <CustomFormField
              control={form.control}
              fieldType={FormFieldTyps.SELECT}
              name="primaryPhysician"
              label="Primary Physician"
              placeholder="select a Physician"
            >
              {Doctors.map((doctor) => (
                <SelectItem key={doctor.name} value={doctor.name}>
                  <div className="flex cursor-pointer items-center gap-2">
                    <Image
                      src={doctor.image}
                      alt={doctor.name}
                      width={32}
                      height={32}
                      className="rounded-full border border-dark-500"
                    />
                    <p>{doctor.name}</p>
                  </div>
                </SelectItem>
              ))}
            </CustomFormField>
            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldTyps.INPUT}
                name="insuranceProvider"
                label="Insurance Provider"
                placeholder="BlueCross BlueShield"
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldTyps.INPUT}
                name="insurancePolicyNumber"
                label="Insurance policy number"
                placeholder="ABC123456789"
              /> 
            </div>
            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldTyps.TEXTAREA}
                name="allergies"
                label="Allergies (if any)"
                placeholder="Peanuts, Penicillin, Pollan"
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldTyps.TEXTAREA}
                name="currentMedications"
                label="Current Medication (if any)"
                placeholder="Ibuprofen 200mg, Paractemol 500mg"
              /> 
            </div>
            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldTyps.TEXTAREA}
                name="familyMedicalHistory"
                label="Family medical history"
                placeholder="Mother had brain cancer , Father had heart disease"
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldTyps.TEXTAREA}
                name="pastMedicalHistory"
                label="Past medical history"
                placeholder="Appendectomy, Tonsillectomy"
              /> 
            </div>
            <section className="space-y-6">
              <div className="mb-9 space-y-1">
                <h2 className="sub-header">Identification and Verification</h2>
              </div>
            </section>
            <CustomFormField
              control={form.control}
              fieldType={FormFieldTyps.SELECT}
              name="identificationType"
              label="Identification type"
              placeholder="Select an identification type"
            >
              {IdentificationTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </CustomFormField>
            <CustomFormField
              control={form.control}
              fieldType={FormFieldTyps.INPUT}
              name="identificationNumber"
              label="Identification number"
              placeholder="123456789"
            />
            <CustomFormField
                control={form.control}
                fieldType={FormFieldTyps.SKELETON}
                name="identificationDocument"
                label="Scanned copy of identification document"
                renderSkeleton={(field:any) => (
                  <FormControl>
                    <FileUploader files={field.value} onChange={field.onChange} />
                  </FormControl>
                )}
              />
            <section className="space-y-6">
              <div className="mb-9 space-y-1">
                <h2 className="sub-header">Consent and Privacy</h2>
              </div>
            </section>
            <CustomFormField
              fieldType={FormFieldTyps.CHECKBOX}
              control={form.control}
              name="treatmentConsent"
              label="I consent to treatment"
            />
            <CustomFormField
              fieldType={FormFieldTyps.CHECKBOX}
              control={form.control}
              name="disclosureConsent"
              label="I consent to disclosure of information"
            />
            <CustomFormField
              fieldType={FormFieldTyps.CHECKBOX}
              control={form.control}
              name="privacyConsent"
              label="I consent to privacy policy"
            />
            <SubmitBtn isLoading={isLoading}>Get Started</SubmitBtn>
          </form>
        </Form>
      );
}

export default RegisterForm;