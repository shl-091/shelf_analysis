
import * as React from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const MODELS = [
  { id: "qwen/qwen-2.5-vl-72b-instruct", name: "Qwen 2.5 VL 72B (Recommended)" },
  { id: "qwen/qwen-vl-max", name: "Qwen VL Max" },
  { id: "qwen/qwen-vl-plus", name: "Qwen VL Plus" },
  { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash (Fastest)" },
  { id: "google/gemini-1.5-flash", name: "Gemini 1.5 Flash" },
  { id: "google/gemini-1.5-pro", name: "Gemini 1.5 Pro" },

  { id: "openai/gpt-4o", name: "GPT-4o (Most Capable)" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini" },
]

interface ModelSelectorProps {
  value: string
  onValueChange: (value: string) => void
}

export function ModelSelector({ value, onValueChange }: ModelSelectorProps) {
  return (
    <div className="w-[280px]">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Available Models</SelectLabel>
            {MODELS.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
