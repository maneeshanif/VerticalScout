"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Sparkles, User, Briefcase, Phone, Award, Loader2 } from "lucide-react";
import { Member } from "@/types";

interface QuickIntakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMemberCreated?: (newMember: Member) => void;
}

export function QuickIntakeDialog({ open, onOpenChange, onMemberCreated }: QuickIntakeDialogProps) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [experience, setExperience] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setDomain("");
    setExperience("");
    setPhone("");
    setDescription("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !domain.trim() || !phone.trim()) {
      toast.error("Please fill in candidate name, domain, and phone number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetchWithAuth("/members", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          domain: domain.trim(),
          experience: experience.trim() || "0-1 years",
          phone: phone.trim(),
          description: description.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to create candidate record.");
      }

      const createdMember: Member = await res.json();
      toast.success(`Candidate "${createdMember.name}" saved to registry!`);
      resetForm();
      onOpenChange(false);
      if (onMemberCreated) {
        onMemberCreated(createdMember);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save candidate.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Plus className="h-3.5 w-3.5" />
            <span>Fast Intake</span>
          </div>
          <DialogTitle className="text-xl font-bold">Register Student Candidate</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Collect candidate details and domain concept. You can run AI vertical evaluation immediately after saving.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              Candidate Full Name <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. Sarah Jenkins"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-9 text-sm"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
              Proposed Domain / Body of Work <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. Commercial HVAC Diagnostics & Preventive Maintenance"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
              className="h-9 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-muted-foreground" />
                Experience
              </label>
              <Input
                placeholder="e.g. 3 years in field"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                Phone <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. +1 555-019-2834"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Venture Context & Notes (Optional)
            </label>
            <Textarea
              placeholder="Key customer segment, existing sponsor leads, expert twin availability..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="h-9 text-xs font-semibold gap-1.5 shadow-sm shadow-primary/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Save Candidate
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
