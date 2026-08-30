import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as useNavigate, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as STAGES, i as SOURCES, n as CHANNELS } from "./types-ilZjrocH.mjs";
import { t as Button } from "./button-wmtQjre2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as Route$2 } from "./router-Dd7I69Cm.mjs";
import { a as useDrafts, c as useLeadMutations, f as useServices, s as useLead, t as useAccess, u as useOutreach } from "./hooks-Mp7UKKeG.mjs";
import { t as Skeleton } from "./skeleton-WRz2gFUH.mjs";
import { r as stageTone, t as Select } from "./select-CrGys0Hn.mjs";
import { t as Badge } from "./badge-Dl6whbLK.mjs";
import { t as Card } from "./card-B6UIYRVq.mjs";
import { n as SourcePost, r as Textarea, t as Label } from "./textarea-C0055CM6.mjs";
import { t as Input } from "./input-C5tgmFWE.mjs";
import { t as UnlockCard } from "./unlock-card-B9FCvxhj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/leads._id-PyG8s84e.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LeadPage() {
	const { id } = Route$2.useParams();
	const leadId = Number(id);
	const { data: lead, isLoading } = useLead(leadId);
	const { data: access } = useAccess();
	const { data: services = [] } = useServices();
	const { data: drafts = [] } = useDrafts(leadId);
	const { update, remove } = useLeadMutations();
	const outreach = useOutreach();
	const navigate = useNavigate();
	const [name, setName] = (0, import_react.useState)("");
	const [company, setCompany] = (0, import_react.useState)("");
	const [roleTitle, setRoleTitle] = (0, import_react.useState)("");
	const [contact, setContact] = (0, import_react.useState)("");
	const [source, setSource] = (0, import_react.useState)("manual");
	const [serviceId, setServiceId] = (0, import_react.useState)("");
	const [stage, setStage] = (0, import_react.useState)("new");
	const [valueUsd, setValueUsd] = (0, import_react.useState)("0");
	const [score, setScore] = (0, import_react.useState)("50");
	const [why, setWhy] = (0, import_react.useState)("");
	const [angle, setAngle] = (0, import_react.useState)("");
	const [nextAction, setNextAction] = (0, import_react.useState)("");
	const [followUpOn, setFollowUpOn] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	const [postUrl, setPostUrl] = (0, import_react.useState)("");
	const [postQuote, setPostQuote] = (0, import_react.useState)("");
	const [channel, setChannel] = (0, import_react.useState)("dm");
	const [extra, setExtra] = (0, import_react.useState)("");
	const [draftBody, setDraftBody] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!lead) return;
		setName(lead.name);
		setCompany(lead.company);
		setRoleTitle(lead.roleTitle);
		setContact(lead.contact);
		setSource(lead.source);
		setServiceId(lead.serviceId ? String(lead.serviceId) : "");
		setStage(lead.stage);
		setValueUsd(String(lead.valueUsd));
		setScore(String(lead.score));
		setWhy(lead.why);
		setAngle(lead.angle);
		setNextAction(lead.nextAction);
		setFollowUpOn(lead.followUpOn ?? "");
		setNotes(lead.notes);
		setPostUrl(lead.postUrl);
		setPostQuote(lead.postQuote);
	}, [lead]);
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-48" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 rounded-xl" })]
	});
	if (!lead) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
		className: "font-display text-4xl",
		children: "Lead not found"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		asChild: true,
		className: "mt-4",
		variant: "outline",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/board",
			children: "Back to board"
		})
	})] });
	function payload() {
		return {
			id: leadId,
			name,
			company,
			roleTitle,
			contact,
			source,
			serviceId: serviceId ? Number(serviceId) : null,
			stage,
			valueUsd: Number(valueUsd) || 0,
			score: Number(score) || 0,
			why,
			angle,
			nextAction,
			followUpOn: followUpOn || null,
			notes,
			postUrl,
			postQuote
		};
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/board",
					className: "text-xs text-muted hover:text-fg",
					children: "Board"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-4xl leading-none",
					children: lead.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: stageTone(lead.stage),
						children: STAGES.find((s) => s.id === lead.stage)?.label
					}), lead.serviceName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: lead.serviceName }) : null]
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "danger",
				onClick: () => {
					if (!window.confirm("Delete this lead?")) return;
					remove.mutate(leadId, {
						onSuccess: () => {
							toast.success("Deleted");
							navigate({ to: "/board" });
						},
						onError: (err) => toast.error(err.message)
					});
				},
				children: "Delete"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mt-6 rounded-xl p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.16em] text-subtle uppercase",
					children: "Source post"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Proof, full thread, other replies. Open it before you pitch."
				}),
				lead.locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-warn",
					children: "Post went dark with the rest of the desk."
				}) : postUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourcePost, {
					url: postUrl,
					quote: postQuote,
					inspectable: access?.canInspect ?? false,
					className: "mt-4",
					onQuote: (next) => {
						if (!postQuote) setPostQuote(next);
					}
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-subtle",
					children: "No post URL yet. Paste one below so you can jump the thread."
				})
			]
		}),
		lead.locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 max-w-xl",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnlockCard, {
				title: "This lead went dark",
				body: "The name is still here. The post, the handle, and the pitch writer come back with $5."
			})
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-8 grid gap-4",
			onSubmit: (e) => {
				e.preventDefault();
				update.mutate(payload(), {
					onSuccess: () => toast.success("Saved"),
					onError: (err) => toast.error(err.message)
				});
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: name,
								onChange: (e) => setName(e.target.value),
								required: true
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Company / act",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: company,
								onChange: (e) => setCompany(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Role",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: roleTitle,
								onChange: (e) => setRoleTitle(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Handle or link",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: contact,
								onChange: (e) => setContact(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Source post URL",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "url",
								inputMode: "url",
								placeholder: "https://x.com/.../status/...",
								value: postUrl,
								onChange: (e) => setPostUrl(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Source",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								value: source,
								onChange: (e) => setSource(e.target.value),
								children: SOURCES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: s.id,
									children: s.label
								}, s.id))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Offer",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: serviceId,
								onChange: (e) => setServiceId(e.target.value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Unassigned"
								}), services.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: s.id,
									children: s.name
								}, s.id))]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Stage",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								value: stage,
								onChange: (e) => setStage(e.target.value),
								children: STAGES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: s.id,
									children: s.label
								}, s.id))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Value USD",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									inputMode: "numeric",
									value: valueUsd,
									onChange: (e) => setValueUsd(e.target.value)
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Score",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									inputMode: "numeric",
									value: score,
									onChange: (e) => setScore(e.target.value)
								})
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "What they posted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						className: "min-h-20",
						value: postQuote,
						onChange: (e) => setPostQuote(e.target.value),
						placeholder: "Paste the ask from the post"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Why they might buy",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						className: "min-h-20",
						value: why,
						onChange: (e) => setWhy(e.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Angle",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						className: "min-h-20",
						value: angle,
						onChange: (e) => setAngle(e.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Next action",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: nextAction,
							onChange: (e) => setNextAction(e.target.value)
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Follow up on",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: followUpOn,
							onChange: (e) => setFollowUpOn(e.target.value)
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Notes",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: notes,
						onChange: (e) => setNotes(e.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: update.isPending || Boolean(lead.locked),
					children: update.isPending ? "Saving" : "Save lead"
				}) })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-12",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl",
					children: "Write the pitch"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "One offer. One sample. One ask."
				}),
				!access ? null : !access.canOutreach ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 max-w-xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnlockCard, {
						title: "Pitch writer is locked",
						body: "You can open the source post on the free desk. The writer that turns it into a DM is $5."
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "mt-4 rounded-xl p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: CHANNELS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setChannel(c.id),
								className: `h-11 rounded-full px-3.5 text-sm ${channel === c.id ? "bg-accent text-accent-fg" : "bg-elevated text-muted"}`,
								children: c.label
							}, c.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Writer notes",
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: extra,
								onChange: (e) => setExtra(e.target.value),
								placeholder: "Mention a specific track, flyer, or site"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-4",
							type: "button",
							disabled: outreach.write.isPending,
							onClick: () => {
								outreach.write.mutate({
									leadId,
									channel,
									extra
								}, {
									onSuccess: (res) => {
										if (!res.ok) {
											toast.error(res.error);
											return;
										}
										setDraftBody(res.body);
									},
									onError: (err) => toast.error(err.message)
								});
							},
							children: outreach.write.isPending ? "Writing" : "Write outreach"
						}),
						draftBody ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 grid gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								className: "min-h-40",
								value: draftBody,
								onChange: (e) => setDraftBody(e.target.value)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "secondary",
										onClick: async () => {
											try {
												await navigator.clipboard.writeText(draftBody);
												toast.success("Copied");
											} catch {
												toast.error("Could not copy");
											}
										},
										children: "Copy"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "outline",
										disabled: outreach.save.isPending,
										onClick: () => outreach.save.mutate({
											leadId,
											channel,
											body: draftBody
										}, {
											onSuccess: () => toast.success("Draft saved"),
											onError: (err) => toast.error(err.message)
										}),
										children: "Save draft"
									}),
									postUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										asChild: true,
										variant: "ghost",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											href: postUrl,
											target: "_blank",
											rel: "noreferrer noopener",
											children: "Reply on the post"
										})
									}) : null
								]
							})]
						}) : null
					]
				}),
				drafts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 grid gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-medium text-muted",
						children: "Saved drafts"
					}), drafts.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "rounded-lg p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-subtle",
							children: [
								CHANNELS.find((c) => c.id === d.channel)?.label,
								" · ",
								d.createdAt.slice(0, 10)
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 whitespace-pre-wrap text-sm text-fg",
							children: d.body
						})]
					}, d.id))]
				}) : null
			]
		})
	] });
}
function Field({ label, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: `grid gap-1.5 ${className ?? ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), children]
	});
}
//#endregion
export { LeadPage as component };
