import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";

export default function MobileDrawerSelect({ 
  value, 
  onValueChange, 
  options = [], 
  placeholder = "בחר אפשרות",
  label,
  trigger
}) {
  const [open, setOpen] = React.useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (val) => {
    onValueChange(val);
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full justify-between">
            <span>{selectedOption?.label || placeholder}</span>
            <ChevronDown size={16} />
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          {label && <DrawerTitle>{label}</DrawerTitle>}
        </DrawerHeader>
        <div className="px-4 pb-8 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full text-right p-4 rounded-xl border transition-all ${
                  value === option.value 
                    ? "border-teal-500 bg-teal-50" 
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option.label}</span>
                  {value === option.value && (
                    <Check size={18} className="text-teal-600" />
                  )}
                </div>
                {option.description && (
                  <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}