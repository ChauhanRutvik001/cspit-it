import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { Users, Search, Award, Target, Calendar, Briefcase, ChevronRight } from "lucide-react";

const statusBadge = (status) => {
	const map = {
		shortlisted: "bg-green-100 text-green-800",
		rejected: "bg-red-100 text-red-800",
		pending: "bg-yellow-100 text-yellow-800",
		active: "bg-yellow-100 text-yellow-800",
		placed: "bg-purple-100 text-purple-800",
	};
	return map[status] || "bg-gray-100 text-gray-800";
};

const dedupeRoundProgress = (roundProgress = []) => {
	const statusPriority = { shortlisted: 4, rejected: 3, pending: 1, active: 1 };
	const map = new Map();
	roundProgress.forEach((rp) => {
		const key = rp.roundNumber;
		const existing = map.get(key);
		if (!existing) {
			map.set(key, rp);
			return;
		}
		const existingTime = new Date(existing.evaluatedAt || existing.attendedAt || 0).getTime();
		const currentTime = new Date(rp.evaluatedAt || rp.attendedAt || 0).getTime();
		const existingPriority = statusPriority[existing.status] ?? 0;
		const currentPriority = statusPriority[rp.status] ?? 0;
		// Prefer the more recent evaluation; if equal/unknown, prefer higher priority status
		if (currentTime > existingTime || (currentTime === existingTime && currentPriority > existingPriority)) {
			map.set(key, rp);
		}
	});
	return Array.from(map.values()).sort((a, b) => a.roundNumber - b.roundNumber);
};

const StudentProgress = () => {
	const user = useSelector((s) => s.app.user);
	const navigate = useNavigate();
	const [students, setStudents] = useState([]);
	const [progress, setProgress] = useState([]);
	const [loading, setLoading] = useState(true);
	const [sidebarSearch, setSidebarSearch] = useState("");
	const [selectedStudentId, setSelectedStudentId] = useState(null);
	const [roundFilter, setRoundFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");

	useEffect(() => {
		if (user?.role !== "counsellor") navigate("/browse");
	}, [user, navigate]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const [studentsRes, progressRes] = await Promise.all([
					axiosInstance.get("/counsellor/my-students"),
					axiosInstance.get("/counsellor/my-students/progress"),
				]);
				const studentsList = studentsRes.data.students || [];
				setStudents(studentsList);
				setProgress(progressRes.data.data || []);
				if (studentsList.length > 0 && !selectedStudentId) {
					setSelectedStudentId(studentsList[0]._id);
				}
			} catch (e) {
				setStudents([]);
				setProgress([]);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const sidebarStudents = useMemo(() => {
		const term = sidebarSearch.trim().toLowerCase();
		return (students || []).filter((s) => {
			const name = s.name?.toLowerCase() || "";
			const sid = s.id?.toLowerCase() || "";
			if (!term) return true;
			return name.includes(term) || sid.includes(term);
		});
	}, [students, sidebarSearch]);

	const selectedProgress = useMemo(() => {
		return (progress || []).filter((p) => p.student?._id === selectedStudentId);
	}, [progress, selectedStudentId]);

	const selectedStudent = useMemo(() => {
		return (students || []).find((s) => s._id === selectedStudentId) || null;
	}, [students, selectedStudentId]);

	const drivesForSelected = useMemo(() => {
		// group by placementDrive._id
		const map = new Map();
		selectedProgress.forEach((p) => {
			const key = p.placementDrive?._id || "unknown";
			if (!map.has(key)) map.set(key, { drive: p.placementDrive, items: [] });
			map.get(key).items.push(p);
		});
		return Array.from(map.values());
	}, [selectedProgress]);

	const allRounds = useMemo(() => {
		const set = new Set();
		selectedProgress.forEach((p) => dedupeRoundProgress(p.roundProgress)?.forEach((rp) => set.add(rp.roundNumber)));
		return Array.from(set).sort((a, b) => a - b);
	}, [selectedProgress]);

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
			<div className="max-w-7xl mx-auto pt-20 p-4">
				<div className="bg-white rounded-xl shadow-xl overflow-hidden">
					<div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-6">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<Users className="h-7 w-7 text-white" />
								<h2 className="text-2xl font-bold text-white font-['Poppins']">Student Progress</h2>
							</div>
							<div className="text-white/90 text-sm">{students.length} Students</div>
						</div>
					</div>
					<div className="flex">
						{/* Sidebar */}
						<div className="w-full md:w-80 border-r border-gray-200 bg-white">
							<div className="p-4 border-b border-gray-100">
								<div className="relative">
									<Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
									<input
										type="text"
										placeholder="Search students..."
										value={sidebarSearch}
										onChange={(e) => setSidebarSearch(e.target.value)}
										className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-emerald-500"
									/>
								</div>
							</div>
							<div className="max-h-[60vh] overflow-y-auto">
								{loading ? (
									<div className="p-4 text-sm text-gray-500">Loading students...</div>
								) : sidebarStudents.length === 0 ? (
									<div className="p-4 text-sm text-gray-500">No students</div>
								) : (
									<ul>
										{sidebarStudents.map((s) => (
											<li key={s._id} className={`px-4 py-3 cursor-pointer border-b border-gray-50 hover:bg-gray-50 ${selectedStudentId === s._id ? 'bg-emerald-50' : ''}`} onClick={() => setSelectedStudentId(s._id)}>
												<div className="flex items-center justify-between">
													<div>
														<div className="text-sm font-medium text-gray-800">{s.name}</div>
														<div className="text-xs text-gray-500">{s.id}</div>
													</div>
													<ChevronRight className="h-4 w-4 text-gray-400" />
												</div>
											</li>
										))}
									</ul>
								)}
							</div>
						</div>

						{/* Detail */}
						<div className="flex-1 p-6">
							{!selectedStudent ? (
								<div className="text-gray-500">Select a student to view progress</div>
							) : (
								<>
									<div className="mb-6">
										<div className="text-xl font-semibold text-gray-800">{selectedStudent.name}</div>
										<div className="text-sm text-gray-500">{selectedStudent.id} • {selectedStudent.email}</div>
									</div>
									<div className="flex flex-wrap gap-3 mb-6">
										<select value={roundFilter} onChange={(e) => setRoundFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
											<option value="all">All rounds</option>
											{allRounds.map((r) => (
												<option key={r} value={r}>Round {r}</option>
											))}
										</select>
										<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
											<option value="all">All statuses</option>
											<option value="active">Active</option>
											<option value="shortlisted">Shortlisted</option>
											<option value="rejected">Rejected</option>
											<option value="placed">Placed</option>
										</select>
									</div>

									{loading ? (
										<div className="py-20 text-center text-gray-500">Loading progress...</div>
									) : drivesForSelected.length === 0 ? (
										<div className="py-20 text-center text-gray-500">No progress for this student</div>
									) : (
										<div className="space-y-6">
											{drivesForSelected.map(({ drive, items }) => {
												// items contain StudentRoundProgress docs for this drive (should be 1)
												const p = items[0];
												const rounds = dedupeRoundProgress(p.roundProgress || []).filter((rp) => {
													if (roundFilter !== 'all' && rp.roundNumber !== Number(roundFilter)) return false;
													if (statusFilter === 'all') return true;
													if (statusFilter === 'placed') return p.overallStatus === 'placed';
													if (statusFilter === 'active') return rp.status !== 'shortlisted' && rp.status !== 'rejected';
													return rp.status === statusFilter;
												});
												return (
													<div key={drive?._id || p._id} className="border border-gray-200 rounded-xl overflow-hidden">
														<div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
															<div className="flex items-center gap-2 text-gray-800 font-medium">
																<Briefcase className="h-4 w-4" />
																<span>{drive?.title || 'Placement Drive'}</span>
															</div>
															<div className="text-sm">
																<span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(p.overallStatus)}`}>{p.overallStatus}</span>
															</div>
														</div>
														<div className="p-4 overflow-x-auto">
															<table className="w-full">
																<thead>
																	<tr className="border-b border-gray-200">
																		<th className="text-left py-2 px-2 text-gray-700 text-sm">Round</th>
																		<th className="text-left py-2 px-2 text-gray-700 text-sm">Status</th>
																		<th className="text-left py-2 px-2 text-gray-700 text-sm">Marks</th>
																	</tr>
																</thead>
																<tbody>
																	{rounds.length === 0 ? (
																		<tr><td colSpan={3} className="py-3 px-2 text-sm text-gray-500">No rounds match filters</td></tr>
																	) : rounds.map((rp) => (
																		<tr key={`${p._id}-${rp.roundNumber}`} className="border-b border-gray-100">
																			<td className="py-2 px-2 text-sm">Round {rp.roundNumber}</td>
																			<td className="py-2 px-2">
																				<span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(rp.status)}`}>{rp.status === 'pending' ? 'active' : rp.status}</span>
																			</td>
																			<td className="py-2 px-2 text-sm">{rp.marksObtained ?? 0} / {rp.maxMarks ?? 100}</td>
																		</tr>) )}
																</tbody>
															</table>
														</div>
													</div>
												);
											})}
										</div>
									)}
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default StudentProgress;
