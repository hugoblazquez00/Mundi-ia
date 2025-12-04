"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  Calendar,
  Users,
  MessageSquare,
  BarChart3,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Plus,
  Edit,
  X,
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from 'next/link';
import { WarpBackground } from "@/components/ui/warp-background";

type Business = {
  id: number
  name: string
}

function BusinessSwitcher({
  businesses,
  selectedBusinessId,
  onSelect,
}: {
  businesses: Business[]
  selectedBusinessId: number | null
  onSelect: (id: number) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null)
  const current = businesses.find((b) => b.id === selectedBusinessId) ?? businesses[0]

  const handleMouseEnter = () => {
    // Cancelar cualquier timeout de cierre pendiente
    if (closeTimeout) {
      clearTimeout(closeTimeout)
      setCloseTimeout(null)
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    // Esperar un poco antes de cerrar para permitir clicks
    const timeout = setTimeout(() => {
      setIsOpen(false)
    }, 200) // 200ms de delay
    setCloseTimeout(timeout)
  }

  const handleItemClick = (id: number) => {
    onSelect(id)
    // No cerrar inmediatamente, dejar que el usuario vea la selección
    // Se cerrará cuando el mouse salga
  }

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (closeTimeout) {
        clearTimeout(closeTimeout)
      }
    }
  }, [closeTimeout])

  return (
    <div 
      className="relative inline-block text-left"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-full border border-[#FF00E0]/30 bg-white/10 px-3 py-1 text-xs text-[#FF00E0] shadow-[0_0_30px_#FF00E0]/20 hover:bg-white/20 transition-all duration-200"
      >
        <span className="h-2 w-2 rounded-full bg-[#FF00E0]" />
        <span>{current?.name ?? "Select business"}</span>
        <svg 
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && businesses.length > 0 && (
        <div className="absolute mt-2 w-56 rounded-xl bg-white shadow-xl border border-[#FF00E0]/20 z-50 overflow-hidden">
          <ul className="max-h-60 overflow-y-auto py-1">
            {businesses.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => handleItemClick(b.id)}
                  onMouseEnter={() => {
                    // Cancelar cierre cuando el mouse entra en un item
                    if (closeTimeout) {
                      clearTimeout(closeTimeout)
                      setCloseTimeout(null)
                    }
                  }}
                  className={`w-full text-left px-4 py-2.5 hover:bg-[#FFE6FC] transition-colors duration-150 flex items-center gap-2 ${
                    b.id === selectedBusinessId 
                      ? "bg-[#FFE6FC] font-semibold text-[#FF00E0]" 
                      : "text-gray-700"
                  }`}
                >
                  {b.id === selectedBusinessId && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FF00E0]" />
                  )}
                  <span>{b.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function QuickActionsCard() {
  return (
    <Card className=" bg-gray-50 backdrop-blur-3xl border border-[#FFB8F7] shadow-2xl shadow-[#FFB8F7]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-[#FF00E0]" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="bg-gradient-to-r from-[#FF00E0] to-[#A30090] hover:from-[#A30090] hover:to-[#FF00E0] text-white rounded-full shadow-lg hover:shadow-[#FF00E0]/30 transition-all duration-300 font-medium">
            <Plus className="mr-2 h-4 w-4" />
            Add Booking
          </Button>
          <Button
            variant="outline"
            className="border-[#FF00E0]/50 text-[#FF00E0] hover:bg-[#FF00E0] hover:text-white hover:border-[#FF00E0] rounded-full transition-all duration-300 bg-transparent"
          >
            <Edit className="mr-2 h-4 w-4" />
            Modify Booking
          </Button>
          <Button
            variant="outline"
            className="border-red-500/50 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-full transition-all duration-300 bg-transparent"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel Booking
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function NotificationsCard() {
  const notifications = [
    {
      id: 1,
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      text: "New booking confirmed for Table 5",
      timestamp: "2 minutes ago",
    },
    {
      id: 2,
      icon: <AlertCircle className="h-4 w-4 text-orange-500" />,
      text: "Booking cancellation - Table 3",
      timestamp: "15 minutes ago",
    },
    {
      id: 3,
      icon: <Bell className="h-4 w-4 text-blue-500" />,
      text: "Reminder: Johnson party arriving in 30 min",
      timestamp: "30 minutes ago",
    },
    {
      id: 4,
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      text: "WhatsApp booking received from Maria",
      timestamp: "1 hour ago",
    },
    {
      id: 5,
      icon: <AlertCircle className="h-4 w-4 text-orange-500" />,
      text: "Table 7 needs attention",
      timestamp: "2 hours ago",
    },
    {
      id: 6,
      icon: <Bell className="h-4 w-4 text-blue-500" />,
      text: "New review received",
      timestamp: "3 hours ago",
    },
  ]

  return (
    <Card className="h-[21rem] bg-white/10 backdrop-blur-3xl border border-[#B8D3FF] shadow-2xl shadow-[#B8D3FF]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Bell className="h-5 w-5 text-[#0062FF]" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="h-56 overflow-hidden">
        <div className="h-full overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-cyan-400/30 scrollbar-track-transparent">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              {notification.icon}
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{notification.text}</p>
                <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function MessagesCenterCard() {
  const messages = [
    {
      id: 1,
      customer: "Maria Garcia",
      message: "Hi, I'd like to change my booking time to 8 PM...",
      timestamp: "5 min ago",
    },
    { id: 2, customer: "John Smith", message: "Can I add one more person to my reservation?", timestamp: "12 min ago" },
    {
      id: 3,
      customer: "Sarah Wilson",
      message: "Thank you for the confirmation! See you tonight.",
      timestamp: "25 min ago",
    },
    { id: 4, customer: "Mike Brown", message: "Is there a parking area near the restaurant?", timestamp: "1 hour ago" },
    {
      id: 5,
      customer: "Lisa Davis",
      message: "Could you please confirm my reservation for tonight?",
      timestamp: "2 hours ago",
    },
    { id: 6, customer: "Tom Wilson", message: "I need to cancel my booking for tomorrow.", timestamp: "3 hours ago" },
  ]

  return (
    <Card className="h-[21rem] bg-gray-50 backdrop-blur-3xl border border-[#E4B8FF] shadow-2xl shadow-[#E4B8FF]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <MessageSquare className="h-5 w-5 text-[#9D00FF]" />
          Messages Center
        </CardTitle>
      </CardHeader>
      <CardContent className="h-56 overflow-hidden">
        <div className="h-full overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-pink-400/30 scrollbar-track-transparent">
          {messages.map((message) => (
            <div
              key={message.id}
              className="flex items-start gap-3 p-3 bg-white backdrop-blur-sm rounded-lg border border-[#9D00FF] hover:bg-[#F5E6FF] transition-all duration-300"
            >
              <Avatar className="h-8 w-8 border border-[#9D00FF]">
                <AvatarFallback className="text-xs bg-[#E4B8FF] text-foreground">
                  {message.customer
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">{message.customer}</p>
                  <p className="text-xs text-muted-foreground">{message.timestamp}</p>
                </div>
                <p className="text-sm text-muted-foreground">{message.message}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function UpcomingBookingsCard({ businessId }: { businessId: number | null }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) {
      setBookings([]);
      setLoading(false);
      return;
    }

    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/reservations?businessId=${businessId}`);
        if (!response.ok) {
          throw new Error('Error al cargar las reservas');
        }
        const data = await response.json();
        // ... mismo procesamiento que ya tenías ...
        const upcomingReservations = data
          .filter((reservation: any) =>
            reservation.status === 'pending' || reservation.status === 'confirmed'
          )
          .map((reservation: any) => ({
            id: reservation.id,
            date: reservation.date,
            time: reservation.time,
            customer: reservation.customerName || 'Cliente',
            guests: reservation.partySize,
            phone: reservation.customerPhone,
            status: reservation.status === 'confirmed' ? 'Confirmed' : 'Pending',
          }))
          .sort((a: any, b: any) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA.getTime() - dateB.getTime();
          });

        setBookings(upcomingReservations);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching reservations:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
    const interval = setInterval(fetchReservations, 5000);
    return () => clearInterval(interval);
  }, [businessId]);

  return (
    <Card className="h-[44rem] bg-white/10 backdrop-blur-3xl border border-[#FFB8F7] shadow-2xl shadow-[#FFB8F7]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Calendar className="h-10 w-5 text-[#FF00E0]" />
          Upcoming Bookings
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[35rem] overflow-hidden">
        {!businessId ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Selecciona un negocio para ver sus reservas</div>
          </div>
        ) : loading && bookings.length === 0 ? (
          // ... existing "Cargando reservas..." ...
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Cargando reservas...</div>
          </div>
        ) : error ? (
          // ... existing error ...
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500">Error: {error}</div>
          </div>
        ) : bookings.length === 0 ? (
          // ... existing "No hay reservas próximas" ...
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">No hay reservas próximas</div>
          </div>
        ) : (
          // ... existing listado de bookings ...
          <div className="h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#FF00E0]/30 scrollbar-track-transparent">
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium text-[#FF00E0]">
                        {booking.time}
                      </div>
                      <div className="text-sm text-foreground">{booking.customer}</div>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="text-xs text-muted-foreground">
                        {booking.guests} {booking.guests === 1 ? 'persona' : 'personas'}
                      </div>
                      {booking.date && (
                        <div className="text-xs text-muted-foreground">
                          {new Date(booking.date).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={booking.status === "Confirmed" ? "default" : "secondary"}
                    className={
                      booking.status === "Confirmed"
                        ? "bg-[#E6FFE8] text-[#00D118] border-[#00FF1E]"
                        : "bg-[#FFE4B8] text-[#D18100] border-[#FFAF2E]"
                    }
                  >
                    {booking.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DailyOverviewCard() {
  return (
    <Card className="mb-8 bg-white/10 backdrop-blur-2xl border border-[#FFB8F7] shadow-2xl shadow-[#FFB8F7]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#FF00E0]" />
          Daily Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-[#FF00E0]/10 to-[#FF5CEC]/10 rounded-lg">
            <div className="text-3xl font-bold text-[#FF00E0]">24</div>
            <div className="text-sm text-gray-600">Total Bookings Today</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg">
            <div className="text-3xl font-bold text-green-600">85%</div>
            <div className="text-sm text-gray-600">Current Occupancy</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">3</div>
            <div className="text-sm text-gray-600">Tables Available</div>
          </div>
        </div>

        {/* Placeholder for hourly occupancy chart */}
        <div className="bg-gray-50/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Hourly Occupancy</h4>
          <div className="h-32 bg-white rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
            <p className="text-gray-500 text-sm">Chart placeholder - Hourly occupancy data</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AnalyticsSummaryCard() {
  return (
    <Card className="mb-8 bg-white/10 backdrop-blur-3xl border border-[#FFB8F7] shadow-2xl shadow-[#FFB8F7]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#FF00E0]" />
          Analytics Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-[#FF00E0]/10 to-[#FF5CEC]/10 rounded-lg">
            <div className="text-2xl font-bold text-[#FF00E0]">+12%</div>
            <div className="text-sm text-gray-600">Weekly Bookings Trend</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">7-9 PM</div>
            <div className="text-sm text-gray-600">Busiest Hours</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">65%</div>
            <div className="text-sm text-gray-600">Returning Customers</div>
          </div>
        </div>

        {/* Placeholder for analytics chart */}
        <div className="bg-gray-50/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Weekly Performance</h4>
          <div className="h-32 bg-white rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
            <p className="text-gray-500 text-sm">Chart placeholder - Weekly analytics data</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Header() {
  return (
    <header className="border-b border-gray-200">
      <nav className="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-xl font-bold text-[#FF00E0]">
                MUNDI-AI
              </Link>
            </div>
          </div>

        </div>
      </nav>
    </header>
  );
}

export default function DashboardPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
  const [businessesLoading, setBusinessesLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await fetch('/api/businesses');
        if (!res.ok) {
          throw new Error('Error al cargar los negocios');
        }
        const data = await res.json();
        setBusinesses(data);
        if (data.length > 0 && !selectedBusinessId) {
          setSelectedBusinessId(data[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setBusinessesLoading(false);
      }
    };

    fetchBusinesses();
  }, [selectedBusinessId]);

  return (
    <section className="relative m-2">
      <Header/>
      <WarpBackground
        beamDuration={8}
        beamDelayMin={1}
        beamDelayMax={4}
        perspective={100}
        beamColors={["#9D00FF", "#0062FF", "#FF00E1", "#6D1D60"]}
      >
        <div className=" ">
          {/* Welcome header */}
          <div className="px-2 lg:px-0 mb-6">
            {businessesLoading || businesses.length === 0 ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FF00E0]/30 bg-white/10 px-3 py-1 text-xs text-[#FF00E0] shadow-[0_0_30px_#FF00E0]/20">
                <span className="h-2 w-2 rounded-full bg-[#FF00E0]" />
                <span>Dashboard</span>
              </div>
            ) : (
              <BusinessSwitcher
                businesses={businesses}
                selectedBusinessId={selectedBusinessId}
                onSelect={(id) => setSelectedBusinessId(id)}
              />
            )}
            <h1 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FF00E0] via-[#9D00FF] to-[#0062FF]">
              Welcome Andy
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Here's what's happening today across your bookings and messages.
            </p>
          </div>
          {/* Full-width grid with no outer gaps */}
          <div className="grid grid-cols-12 gap-4 lg:gap-6 px-0 w-full">
            {/* Quick Actions - full width */}
            <div className="col-span-12">
              <QuickActionsCard />
            </div>

            {/* Row: Left (Notifications + Messages stacked) | Right (UpcomingBookings full height) */}
            <div className="col-span-12 grid grid-cols-12 gap-4 lg:gap-6">
              <div className="col-span-12 lg:col-span-6 space-y-4 lg:space-y-6">
                <NotificationsCard />
                <MessagesCenterCard />
              </div>
              <div className="col-span-12 lg:col-span-6 ">
                <UpcomingBookingsCard businessId={selectedBusinessId} />
              </div>
            </div>
            
            {/* Overview (DailyOverview) - full width */}
            <div className="col-span-12">
              <DailyOverviewCard />
            </div>

            {/* Analytics Summary - full width */}
            <div className="col-span-12">
              <AnalyticsSummaryCard />
            </div>
          </div> 
          
        </div>
      </WarpBackground>
    </section>
  )
}