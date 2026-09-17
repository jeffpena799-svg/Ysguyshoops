import React, { useEffect, useState } from "react";

type Player = { id: string; name: string };
type Entry = { playerId: string; status: string; food: string };
type Event = { id: string; title: string; date: string; location: string; notes: string; status: string; responses: Entry[]; payments?: Record<string, boolean> };
const labels: Record<string, string> = { going: "Coming", maybe: "Maybe", out: "Not coming" };
function HarvestLeaves({ side }: { side: "left" | "right" }) {
  return <svg className={`hoopLeaves hoopLeaves-${side}`} viewBox="0 0 100 130" aria-hidden="true" focusable="false">
    <path d="M22 118 Q65 78 70 14" fill="none" stroke="#d9b567" strokeWidth="2" />
    <path d="M52 83 Q8 88 14 48 Q47 45 52 83Z" fill="#b95a2d" />
    <path d="M62 63 Q97 70 93 30 Q62 33 62 63Z" fill="#d9a441" />
    <path d="M67 40 Q35 34 45 6 Q72 12 67 40Z" fill="#c87b35" />
    <path d="M36 101 Q8 112 5 84 Q29 74 36 101Z" fill="#9b4031" />
    <path d="M52 83 L23 56 M62 63 L85 39 M67 40 L49 14 M36 101 L12 89" fill="none" stroke="#f4dcaa" strokeWidth="1.5" opacity=".7" />
  </svg>;
}
async function api(token: string, body?: object) {
  const response = await fetch(`/api/hoopsgiving${!body && token ? "?admin=1" : ""}`, { method: body ? "POST" : "GET", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Could not save Hoopsgiving");
  return result;
}
export default function Hoopsgiving({ players, myPlayer, onChoosePlayer, token = "" }: { players: Player[]; myPlayer?: Player; onChoosePlayer?: () => void; token?: string }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [selected, setSelected] = useState("");
  const [food, setFood] = useState("");
  const [status, setStatus] = useState("going");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const event = token ? events.find(item => item.id === selected) || events[0] : events[0];
  useEffect(() => { let active = true; api(token).then(result => { if (active) setEvents(result.events); }).catch(error => { if (active) setMessage(error.message); }).finally(() => { if (active) setLoaded(true); }); return () => { active = false; }; }, [token]);
  useEffect(() => { const entry = event?.responses.find(item => item.playerId === myPlayer?.id); setFood(entry?.food || ""); setStatus(entry?.status || "going"); }, [event?.id, myPlayer?.id]);
  async function save(body: object) {
    setBusy(true); setMessage("");
    try {
      const result = await api(token, body);
      if (result.event) { setEvents(previous => [result.event, ...previous.filter(item => item.id !== result.event.id)]); setSelected(result.event.id); }
      else setEvents(previous => previous.filter(item => item.id !== event?.id));
      setMessage("Saved");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Please retry"); }
    finally { setBusy(false); }
  }
  if (!token && (!loaded || (!event && !message))) return null;
  return <section className="hoopEvent"><style>{css}</style>
    <header className="hoopHarvestHeader"><HarvestLeaves side="left"/><div><small>Y’S GUYS · GATHER & GIVE THANKS</small><h2>{event?.title || "Hoopsgiving"}</h2><span>PLAYERS ONLY · NO GUESTS</span></div><HarvestLeaves side="right"/></header>
    {token && <><p>Manage attendance, food and private payment records here. Archived events remain in this section only.</p><button disabled={busy} onClick={() => save({ action: "create" })}>Create event</button><label>Event<select value={event?.id || ""} onChange={e => setSelected(e.target.value)}>{events.map(item => <option key={item.id} value={item.id}>{item.title} · {item.status}</option>)}</select></label></>}
    {event && <>
      {token ? <form key={event.id + event.status} onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); save({ action: "edit", eventId: event.id, title: form.get("title"), date: form.get("date"), location: form.get("location"), notes: form.get("notes"), status: form.get("status") }); }}>
        <label>Title<input name="title" defaultValue={event.title} maxLength={80} required /></label><label>Date & time<input name="date" defaultValue={event.date} maxLength={40} placeholder="Enter event date and time" /></label><label>Location<input name="location" defaultValue={event.location} maxLength={160} /></label><label>Details<textarea name="notes" defaultValue={event.notes} maxLength={600} /></label><label>Visibility<select name="status" defaultValue={event.status}><option value="draft">Draft · hidden from Home</option><option value="open">Open sign-ups · show on Home</option><option value="closed">Closed · show final sheet on Home</option><option value="archived">Archived · hide from Home</option></select></label><button disabled={busy}>Save event</button>
      </form> : <><p>{[event.date, event.location].filter(Boolean).join(" · ")}</p>{event.notes && <p>{event.notes}</p>}<b>{event.responses.filter(item => item.status === "going").length} coming · {event.responses.filter(item => item.status === "maybe").length} maybe</b>
        {event.status === "open" ? myPlayer ? <form onSubmit={e => { e.preventDefault(); save({ action: "rsvp", eventId: event.id, playerId: myPlayer.id, status, food }); }}><p>Signing up as <strong>{myPlayer.name}</strong></p><label>Are you coming?<select value={status} onChange={e => setStatus(e.target.value)}>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Food you’re bringing<input value={food} onChange={e => setFood(e.target.value)} maxLength={160} placeholder="Dish, drinks or supplies (optional)" /></label><button disabled={busy}>{busy ? "Saving…" : "Save my response"}</button></form> : <button onClick={onChoosePlayer}>Choose My Player to sign up</button> : <p>Sign-ups are closed.</p>}</>}
      <details open={Boolean(token)}><summary>Attendance & food ({event.responses.length})</summary><ul>{(token ? players : players.filter(player => event.responses.some(item => item.playerId === player.id))).map(player => { const entry = event.responses.find(item => item.playerId === player.id); return <li key={player.id}><div><strong>{player.name}</strong><span>{entry ? labels[entry.status] : "No response"}</span>{entry?.food && entry.status !== "out" && <span>Bringing: {entry.food}</span>}</div>{token && <label className="hoopPaid"><input type="checkbox" disabled={busy} checked={Boolean(event.payments?.[player.id])} onChange={e => save({ action: "payment", eventId: event.id, playerId: player.id, paid: e.target.checked })} />{event.payments?.[player.id] ? "Paid" : "Unpaid"}</label>}</li>; })}</ul>{!event.responses.length && !token && <p>No responses yet.</p>}</details>
      {token && <><p>Payment checklist is private to Commissioner Mode.</p><button className="hoopDelete" disabled={busy} onClick={() => { if (confirm(`Permanently delete ${event.title} and all its attendance, food and payment records? Archive instead to keep them.`)) save({ action: "delete", eventId: event.id, confirmation: "DELETE" }); }}>Delete event permanently</button></>}
    </>}
    <p role="status">{message}</p>
  </section>;
}
const css = `.hoopEvent{background:linear-gradient(135deg,#fffaf0,#fffdf8 65%,#f8edd6);color:#14243a;border:2px solid #c9a64e;border-radius:22px;padding:20px;margin:18px 0;min-width:0;box-shadow:inset 0 0 0 5px #fff8e8}.hoopHarvestHeader{position:relative;isolation:isolate;overflow:hidden;background:linear-gradient(120deg,#10294a,#1a3046);border:1px solid #c9a64e;border-radius:15px;padding:24px 48px;text-align:center;color:#fff5df}.hoopHarvestHeader>div{position:relative;z-index:1}.hoopEvent header small{color:#efd298;font-size:10px;font-weight:900;letter-spacing:1.4px}.hoopHarvestHeader span{font-size:10px;letter-spacing:1.3px;font-weight:800;color:#f0dbc0}.hoopLeaves{position:absolute;top:0;bottom:0;height:100%;width:66px;opacity:.85;pointer-events:none}.hoopLeaves-left{left:-10px}.hoopLeaves-right{right:-10px;transform:scaleX(-1)}.hoopEvent h2{margin:8px 0;font-size:clamp(24px,5vw,32px);overflow-wrap:anywhere}.hoopEvent p{line-height:1.5}.hoopEvent label{display:flex;flex-direction:column;gap:7px;margin:12px 0;font-weight:700}.hoopEvent input,.hoopEvent select,.hoopEvent textarea{box-sizing:border-box;width:100%;padding:12px;font:inherit;border:1px solid #d9cdb5;border-radius:10px;color:#14243a;background:#fff}.hoopEvent button{padding:12px 16px;background:#0c2c56;color:white;border:0;border-radius:12px;font:inherit;font-weight:800;cursor:pointer;min-height:44px}.hoopEvent button:disabled{opacity:.5}.hoopEvent summary{padding:16px 0;font-weight:800;cursor:pointer;color:#754021}.hoopEvent ul{list-style:none;margin:0;padding:0}.hoopEvent li{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:12px 0;border-top:1px solid #e6d9bf}.hoopEvent li div{display:flex;flex-direction:column;gap:4px;overflow-wrap:anywhere;min-width:0}.hoopEvent li span{font-size:14px;color:#475569}.hoopEvent .hoopPaid{flex-direction:row;align-items:center;white-space:nowrap}.hoopEvent .hoopPaid input{width:20px;height:20px}.hoopEvent .hoopDelete{background:#fff0f0;color:#a62e2e}.hoopEvent input:focus-visible,.hoopEvent select:focus-visible,.hoopEvent textarea:focus-visible,.hoopEvent button:focus-visible,.hoopEvent summary:focus-visible{outline:3px solid #b95a2d;outline-offset:3px}`;
