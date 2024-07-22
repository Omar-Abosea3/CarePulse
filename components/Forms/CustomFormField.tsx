"use client";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import Image from "next/image";
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import { FormFieldTyps } from "./PatientForm";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Select, SelectContent, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
interface CustomProps{
    control:Control<any>,
    fieldType:FormFieldTyps,
    name:string,
    label?:string,
    placeholder?:string,
    iconSrc?:string,
    iconAlt?:string,
    disabled?:boolean,
    dateFormat?:string,
    showTimeSelect?:boolean,
    children?:React.ReactNode,
    renderSkeleton?:any
}

const RenderInput = ({field , props}:{field:any , props:CustomProps}) => {
    const {children , control , fieldType , name , placeholder , dateFormat , disabled , iconAlt ,iconSrc , label,showTimeSelect , renderSkeleton} = props;
    switch (fieldType) {
      case FormFieldTyps.INPUT:
        return (
          <div className="flex rounded-md border border-dark-500 bg-dark-400">
            {iconSrc && (
              <Image
                src={iconSrc}
                //@ts-ignore
                alt={iconAlt}
                width={24}
                height={24}
                className="ml-2"
              />
            )}
            <FormControl>
              <Input
                placeholder={placeholder}
                {...field}
                className="shad-input border-0"
              />
            </FormControl>
          </div>
        )
      case FormFieldTyps.PHONNE_INPUT:
        return (
          <FormControl>
            <PhoneInput
              defaultCountry="EG"
              placeholder={placeholder}
              international
              withCountryCallingCode
              //@ts-ignore
              value={field.value as E164Number | undefined}
              onChange={field.onChange}
              className="input-phone"
            />
          </FormControl>
        )
      case FormFieldTyps.DATE_PICKER:
        return (
          <div className="flex rounded-md border border-dark-500 bg-dark-400">
            <Image
              src="/assets/icons/calendar.svg"
              alt="calendar"
              width={24}
              height={24}
              className="ml-2"
            />
            <FormControl>
              <DatePicker
                selected={field.value}
                onChange={(date) => field.onChange(date)}
                dateFormat={dateFormat ?? 'MM/dd/yyy'}
                showTimeSelect={showTimeSelect??false}
                timeInputLabel="Time"
                wrapperClassName="date-picker"
              />
            </FormControl>
          </div>
        );
      case FormFieldTyps.SKELETON:
        return (
          renderSkeleton?renderSkeleton(field):null
        )
      case FormFieldTyps.SELECT:
        return (
          <FormControl>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                  <SelectTrigger className="shad-select-trigger">
                    <SelectValue placeholder={placeholder}/>
                  </SelectTrigger>
              </FormControl>
              <SelectContent className="shad-select-content">
                {children}
              </SelectContent>
            </Select>
          </FormControl>
        )
      case FormFieldTyps.TEXTAREA:
        return (
          <FormControl>
            <Textarea
              placeholder={placeholder}
              {...field}
              className="shad-textArea"
              disabled={disabled}
            >

            </Textarea>
          </FormControl>
        )
      case FormFieldTyps.CHECKBOX:
        return (
          <FormControl>
            <div className="flex items-center gap-4">
              <Checkbox
                id={name}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <label htmlFor={name} className="checkbox-label">
                {label}
              </label>
            </div>
          </FormControl>
        )
      default:
        break;
    }
}
const CustomFormField = (props:CustomProps) => {
    const {control , fieldType , name , iconSrc , iconAlt , label , placeholder , children , dateFormat , disabled , showTimeSelect} = props;
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1">
          {fieldType !== FormFieldTyps.CHECKBOX && label &&(
            <FormLabel>{label}</FormLabel>
          )}
          <RenderInput field={field} props={props}/>
        </FormItem>
      )}
    />
  );
}

export default CustomFormField