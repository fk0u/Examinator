export type AttemptStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "TIMED_OUT"
  | "FORCE_SUBMITTED";

export function getAttemptStatusMeta(status: AttemptStatus) {
  if (status === "IN_PROGRESS") {
    return {
      label: "Sedang Berjalan",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      icon: "pending_actions",
    };
  }

  if (status === "SUBMITTED") {
    return {
      label: "Selesai",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: "task_alt",
    };
  }

  if (status === "TIMED_OUT") {
    return {
      label: "Waktu Habis",
      badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
      icon: "timer_off",
    };
  }

  if (status === "FORCE_SUBMITTED") {
    return {
      label: "Dihentikan Sistem",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      icon: "gpp_bad",
    };
  }

  return {
    label: "Belum Dimulai",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    icon: "play_circle",
  };
}
