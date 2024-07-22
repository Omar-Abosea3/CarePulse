"use server";
import { ID, Query } from "node-appwrite";
import { APPOINTMENT_COLLECTION_ID, databases, DB_ID, messaging } from "../appwrite.config";
import { formatDateTime, parseStringify } from "@/utils/utils";
import { Appointment } from "@/types/appWrite.types";
import { revalidatePath } from "next/cache";

export const createAppointment = async (appointment:CreateAppointmentParams) => {
    try {
        const newAppointment = await databases.createDocument(
            DB_ID!,
            APPOINTMENT_COLLECTION_ID!,
            ID.unique(),
            appointment
        )
          return parseStringify(newAppointment);
    } catch (error) {
        console.log(error);
        
    }
}

export const getAppointment = async (appointmentId:string) => {
    try {
        const appointment = await databases.getDocument(
            DB_ID!,
            APPOINTMENT_COLLECTION_ID!,
            appointmentId
        )
        return parseStringify(appointment);
    } catch (error) {
        console.log(error);
    }
}

export const getRecentAppointmentList = async () => {
    try {
        const appointments = await databases.listDocuments(
            DB_ID!,
            APPOINTMENT_COLLECTION_ID!,
            [Query.orderDesc('$createdAt')]
        );

        const initialCounts = {
            scheduledCount: 0,
            pendingCount:0,
            cancelledCount:0
        }

        const counts = (appointments.documents as Appointment[]).reduce((acc, appointment) => {
            if (appointment.status === 'scheduled'){
                acc.scheduledCount += 1  
            } else if(appointment.status === 'pending'){
                 acc.pendingCount += 1
            } else if(appointment.status === 'cancelled'){
                acc.cancelledCount += 1 
            }
            return acc;
        },initialCounts);

        const data= {
            totalCount:appointments.total,
            ...counts,
            documents:appointments.documents
        }
        return parseStringify(data);
    } catch (error) {
        console.log(error);
        
    }
}

export const updateAppointment = async ({appointmentId , userId , appointment , type} : UpdateAppointmentParams) => {
  try {
    const updatedAppointment = await databases.updateDocument(
      DB_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      appointment
    );

    if(!updatedAppointment) {
        throw new Error('Appointment not found');
    }
    
    const smsMessage = `
    Hi it’s CarePulse. 
    ${
      type === "schedule"
        ? `Your appointment has been scheduled for ${formatDateTime(
            appointment.schedule!
          ).dateTime} with Dr. ${appointment.primaryPhysician}`
        : `We regret to inform you that your appointment has been cancelled for the following reason ${appointment.cancellationReason} `
    }.`;
    const newAppointment = await databases.getDocument(
        DB_ID!,
        APPOINTMENT_COLLECTION_ID!,
        appointmentId
    )
    const resultApp = parseStringify(newAppointment);

    await sendSMSNotification(userId , smsMessage , resultApp);
    revalidatePath('/admin');
    return parseStringify(updatedAppointment);
  } catch (error) {
    console.log(error); 
  }  
}

export const sendSMSNotification = async (
  userId: string,
  content: string,
  appointment: Appointment
) => {
  const myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    `App ${process.env.NEXT_PUBLIC_INFOBIP_API_KEY}`
  );
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept", "application/json");

  const raw = JSON.stringify({
    messages: [
      {
        destinations: [{ to: appointment.patient.phone }],
        from: "CarePulse",
        text: content,
      },
    ],
  });

  const requestOptions: any = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch("https://xln2eq.api.infobip.com/sms/2/text/advanced", requestOptions)
    .then((response) => response.json())
    .then((result) => console.log(result))
    .catch((error) => console.error(error));
}; 