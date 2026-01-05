import { useState } from "react";
import { Button } from "@/components/ui/button";
import ContactFormDialog from "../ContactFormDialog";

export default function ContactFormDialogExample() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="p-8 flex items-center justify-center min-h-[300px]">
      <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>
      <ContactFormDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={(data) => {
          console.log("Form submitted:", data);
          setIsOpen(false);
        }}
      />
    </div>
  );
}
