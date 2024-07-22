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
import { Dispatch, SetStateAction, useState } from "react";

import { useRouter } from "next/navigation";
import { createUser } from "@/lib/actions/patient.actions";
import { FormFieldTyps } from "./PatientForm";
import { SelectItem } from "../ui/select";
import Image from "next/image";
import { Doctors } from "@/constants";
import { getAppointmentSchema } from "@/lib/validation";
import { createAppointment, updateAppointment } from "@/lib/actions/appointment.actions";
import { Appointment } from "@/types/appWrite.types";




const AppointmentForm = ({
    userId,
    patientId,
    type = "create",
    setOpen,
    appointment
}:{
    userId:string,
    patientId:string,
    type:"create" | "cancel" | "schedule",
    setOpen?: Dispatch<SetStateAction<boolean>>,
    appointment?:Appointment
}) => {
    const AppointMentFormValidation = getAppointmentSchema(type);
    const form = useForm<z.infer<typeof AppointMentFormValidation>>({
        resolver: zodResolver(AppointMentFormValidation),
        defaultValues: {
          primaryPhysician:appointment ? appointment?.primaryPhysician:'',
          schedule: appointment? new Date(appointment?.schedule) : new Date(Date.now()),
          reason: appointment ? appointment.reason : '',
          note: appointment?.note || '',
          cancellationReason:  appointment?.cancellationReason || '',
        },
      });
      const [isLoading, setisLoading] = useState(false);
      const router = useRouter();
      // 2. Define a submit handler.
      async function onSubmit(values: z.infer<typeof AppointMentFormValidation>) {
        console.log('hello in submit');
        
        setisLoading(true);
      
        let status;
        switch (type) {
            case 'schedule':
                status = 'scheduled'
                break;
            case 'cancel':
                status = 'cancelled'
                break;
            default:
                status = 'pending'
                break;   
        }
        try {
            if(type === 'create' && patientId){
              console.log('on submiting' , type);
              
                const appointmentData = {
                    userId,
                    patient:patientId,
                    primaryPhysician:values.primaryPhysician,
                    schedule:new Date(values.schedule),
                    reason:values.reason!,
                    note:values.note,
                    status:status as Status,
                }
                const appointment = await createAppointment(appointmentData);
                if(appointment) {
                    form.reset();
                    router.push(`/patients/${userId}/new-appointment/success?appointmentId=${appointment.$id}`)
                }
            } else {
              console.log('update appointment');
              
              const appointmentToUpdate = {
                userId,
                appointmentId:appointment?.$id!,
                appointment:{
                  primaryPhysician:values.primaryPhysician,
                  schedule:new Date(values?.schedule),
                  status:status as Status,
                  cancellationReason:values?.cancellationReason,
                },
                type
              };

              const updatedAppointment = await updateAppointment(appointmentToUpdate);
              if(updatedAppointment) {
                setOpen && setOpen(false);
                form.reset();
              }
            }
        } catch (error) {
            console.log(error);
            
        }
        setisLoading(false);
      }

      let buttonLabel;
      switch (type) {
        case "cancel":
          buttonLabel = "Cancel Appointment";
          break;
        case "schedule":
          buttonLabel = "Schedule Appointment";
          break;
        default:
          buttonLabel = "Submit Apppointment";
      }
      return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {type === 'create' &&<section className="mb-12 space-y-4">
              <h1 className="header">New Appointment</h1>
              <p className="text-dark-700">
                Request a new appointment in 10 seconds
              </p>
            </section>}
            {type !== "cancel" && (
              <>
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldTyps.SELECT}
                  name="primaryPhysician"
                  label="Primary Physician"
                  placeholder="Select a doctor"
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
                <CustomFormField
                    fieldType={FormFieldTyps.DATE_PICKER}
                    control={form.control}
                    name="schedule"
                    label="Expected appointment date"
                    showTimeSelect
                    dateFormat="MM/dd/yyyy - hh:mm aa"
                />
                <div className="flex flex-col gap-6 xl:flex-row">
                    <CustomFormField
                        control={form.control}
                        fieldType={FormFieldTyps.TEXTAREA}
                        name="reason"
                        label="Reason for appointment"
                        placeholder="Enter reason for appointment"
                    /> 
                    <CustomFormField
                        control={form.control}
                        fieldType={FormFieldTyps.TEXTAREA}
                        name="notes"
                        label="Notes"
                        placeholder="Enter notes"
                    /> 
                </div>
              </>
            )}
            {type === "cancel" && (
                <CustomFormField
                    control={form.control}
                    fieldType={FormFieldTyps.TEXTAREA}
                    name="cancellationReason"
                    label="Reason for cancellation"
                    placeholder="Enter reason for cancellation"
                /> 
            )}

            <SubmitBtn isLoading={isLoading} className={`${type === 'cancel' ? 'shad-danger-btn'
                :'shad-primary-btn'
            } w-full`}>{buttonLabel}</SubmitBtn>
          </form>
        </Form>
      );
}

export default AppointmentForm;