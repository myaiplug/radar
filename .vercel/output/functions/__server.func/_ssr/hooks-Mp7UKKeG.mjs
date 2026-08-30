import { r as createServerFn } from "./ssr.mjs";
import { o as authMiddleware } from "./types-ilZjrocH.mjs";
import { r as getAccess, t as createSsrRpc } from "./access-Pgm3kykF.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as confirmCheckout, r as startCheckout } from "./router-Dd7I69Cm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hooks-Mp7UKKeG.js
var runHunt = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("42a4b1412cb69cb69906ed8a5aaf6ff627d5ba4794fa7b9ebe0cd9f8a5fe4611"));
var inspectThread = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("0a9ff759a75cc3721ca28a268378b06debbd5c7ff7d1236baf0b43f15b09e391"));
var writeOutreach = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("1588df446e5c6448b7c4ccbffb07be98437e17c2a1e3f3345a50a8c4283c4a75"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("fd206e699af5081fb6a2f67cb243c39411dfabcd71293209e3a9060ac80a5346"));
var listServices = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("e050bc866bded5e904f2676ff7035a43721ad60ae3291ebea8d938b3e90359bd"));
var updateService = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("21e90d9e82c4f854876e3ea68ebe3bb9cddc03353c792a2bfa1d3efff958b66d"));
var listLeads = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("c4871a25376f4842d69dd2f2b10fffd5f6b0944b9cafdbf23468fa57f98fa0f1"));
var getLead = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((id) => id).handler(createSsrRpc("2f3d4b17f060458feab44451804953af46c208cca5c021787f6c7c3b44ec74a2"));
var createLead = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("dc68e05a5c3d42faf42c03c7f886f515bd1f8a93cefd3c96e01334813ba0c4fb"));
var updateLead = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("639e82983d4f8a641aa92b51d3d4a021c7bbc72f5cf8c82e590f95ab0bab76cb"));
var setLeadStage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("c2e118ea7d93a9efc429838946f6b7bba4bc5a222e3ed77c54588c5828abaf69"));
var deleteLead = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(createSsrRpc("5c10eee5b809ce7cbb26e90ba173fb78ea2426ef20aee0413687e465ad9be70a"));
var getDeskStats = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("0607d42f70886ccde202d466331640d7b6f16f1a5d497d5040c75339a1f230c7"));
var listDrafts = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((leadId) => leadId).handler(createSsrRpc("8bacdf9015750787f9ca40e76e59815e7a3812a70e3838c821bee5369883a95f"));
var saveDraft = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("db3c9a46e5a0cdc302397252592bf33f993b6707bb158fe36eff32a9c4fd8f3e"));
function useInvalidateDesk() {
	const qc = useQueryClient();
	return () => {
		qc.invalidateQueries({ queryKey: ["leads"] });
		qc.invalidateQueries({ queryKey: ["stats"] });
		qc.invalidateQueries({ queryKey: ["lead"] });
		qc.invalidateQueries({ queryKey: ["access"] });
	};
}
function useServices() {
	return useQuery({
		queryKey: ["services"],
		queryFn: () => listServices()
	});
}
function useLeads() {
	return useQuery({
		queryKey: ["leads"],
		queryFn: () => listLeads()
	});
}
function useLead(id) {
	return useQuery({
		queryKey: ["lead", id],
		queryFn: () => getLead({ data: id }),
		enabled: Number.isFinite(id)
	});
}
function useDeskStats() {
	return useQuery({
		queryKey: ["stats"],
		queryFn: () => getDeskStats()
	});
}
function useAccess() {
	return useQuery({
		queryKey: ["access"],
		queryFn: () => getAccess()
	});
}
function useDrafts(leadId) {
	return useQuery({
		queryKey: ["drafts", leadId],
		queryFn: () => listDrafts({ data: leadId }),
		enabled: Number.isFinite(leadId)
	});
}
function useLeadMutations() {
	const invalidate = useInvalidateDesk();
	return {
		create: useMutation({
			mutationFn: (input) => createLead({ data: input }),
			onSuccess: invalidate
		}),
		update: useMutation({
			mutationFn: (input) => updateLead({ data: input }),
			onSuccess: invalidate
		}),
		stage: useMutation({
			mutationFn: (input) => setLeadStage({ data: input }),
			onSuccess: invalidate
		}),
		remove: useMutation({
			mutationFn: (id) => deleteLead({ data: id }),
			onSuccess: invalidate
		})
	};
}
function useServiceMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input) => updateService({ data: input }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["services"] });
		}
	});
}
function useHunt() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input) => runHunt({ data: input }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["access"] });
		}
	});
}
function useThreadPeek() {
	return useMutation({ mutationFn: (postUrl) => inspectThread({ data: { postUrl } }) });
}
function useOutreach() {
	const qc = useQueryClient();
	return {
		write: useMutation({ mutationFn: (input) => writeOutreach({ data: input }) }),
		save: useMutation({
			mutationFn: (input) => saveDraft({ data: input }),
			onSuccess: (_d, vars) => {
				qc.invalidateQueries({ queryKey: ["drafts", vars.leadId] });
			}
		})
	};
}
function useCheckout() {
	const invalidate = useInvalidateDesk();
	return useMutation({
		mutationFn: () => startCheckout(),
		onSuccess: (res) => {
			if (res.ok && "unlocked" in res && res.unlocked) invalidate();
		}
	});
}
function useConfirmCheckout() {
	const invalidate = useInvalidateDesk();
	return useMutation({
		mutationFn: (input) => confirmCheckout({ data: input }),
		onSuccess: (res) => {
			if (res.ok) invalidate();
		}
	});
}
//#endregion
export { useDrafts as a, useLeadMutations as c, useServiceMutation as d, useServices as f, useDeskStats as i, useLeads as l, useCheckout as n, useHunt as o, useThreadPeek as p, useConfirmCheckout as r, useLead as s, useAccess as t, useOutreach as u };
