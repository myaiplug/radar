import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inspectThread, runHunt, writeOutreach } from "./ai";
import { getAccess } from "./access";
import { confirmCheckout, startCheckout } from "./billing";
import {
  createLead,
  deleteLead,
  getDeskStats,
  getLead,
  listDrafts,
  listLeads,
  listServices,
  saveDraft,
  setLeadStage,
  updateLead,
  updateService,
  type LeadInput,
} from "./server";
import type { ChannelId, StageId } from "./types";

function useInvalidateDesk() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ["leads"] });
    void qc.invalidateQueries({ queryKey: ["stats"] });
    void qc.invalidateQueries({ queryKey: ["lead"] });
    void qc.invalidateQueries({ queryKey: ["access"] });
  };
}

export function useServices() {
  return useQuery({ queryKey: ["services"], queryFn: () => listServices() });
}

export function useLeads() {
  return useQuery({ queryKey: ["leads"], queryFn: () => listLeads() });
}

export function useLead(id: number) {
  return useQuery({
    queryKey: ["lead", id],
    queryFn: () => getLead({ data: id }),
    enabled: Number.isFinite(id),
  });
}

export function useDeskStats() {
  return useQuery({ queryKey: ["stats"], queryFn: () => getDeskStats() });
}

export function useAccess() {
  return useQuery({ queryKey: ["access"], queryFn: () => getAccess() });
}

export function useDrafts(leadId: number) {
  return useQuery({
    queryKey: ["drafts", leadId],
    queryFn: () => listDrafts({ data: leadId }),
    enabled: Number.isFinite(leadId),
  });
}

export function useLeadMutations() {
  const invalidate = useInvalidateDesk();

  const create = useMutation({
    mutationFn: (input: LeadInput) => createLead({ data: input }),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: (input: LeadInput & { id: number }) => updateLead({ data: input }),
    onSuccess: invalidate,
  });
  const stage = useMutation({
    mutationFn: (input: { id: number; stage: StageId }) => setLeadStage({ data: input }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: number) => deleteLead({ data: id }),
    onSuccess: invalidate,
  });

  return { create, update, stage, remove };
}

export function useServiceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: number; rateLabel?: string; active?: boolean; blurb?: string }) =>
      updateService({ data: input }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useHunt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      serviceIds: number[];
      niche: string;
      geo: string;
      notes: string;
      windowHours: number;
    }) => runHunt({ data: input }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["access"] });
    },
  });
}

export function useThreadPeek() {
  return useMutation({
    mutationFn: (postUrl: string) => inspectThread({ data: { postUrl } }),
  });
}

export function useOutreach() {
  const qc = useQueryClient();
  const write = useMutation({
    mutationFn: (input: { leadId: number; channel: ChannelId; extra?: string }) =>
      writeOutreach({ data: input }),
  });
  const save = useMutation({
    mutationFn: (input: { leadId: number; channel: ChannelId; body: string }) =>
      saveDraft({ data: input }),
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: ["drafts", vars.leadId] });
    },
  });
  return { write, save };
}

export function useCheckout() {
  const invalidate = useInvalidateDesk();
  return useMutation({
    mutationFn: () => startCheckout(),
    onSuccess: (res) => {
      if (res.ok && "unlocked" in res && res.unlocked) invalidate();
    },
  });
}

export function useConfirmCheckout() {
  const invalidate = useInvalidateDesk();
  return useMutation({
    mutationFn: (input: { sessionId: string }) => confirmCheckout({ data: input }),
    onSuccess: (res) => {
      if (res.ok) invalidate();
    },
  });
}
