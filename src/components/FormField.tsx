const fieldBase =
  "border border-neutral-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-neutral-400 focus:border-black [color-scheme:light]";

export const inputClassName = `w-full min-w-0 ${fieldBase}`;

export const selectClassName = inputClassName;

export const prefixSelectClassName = `w-[6.5rem] shrink-0 ${fieldBase}`;

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}

export function FormField({ label, children, required, hint }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-black">
        {label}
        {required && <span className="ml-0.5 text-neutral-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}
