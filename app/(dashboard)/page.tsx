"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, MessageSquare, BarChart3, Bell, Check, ArrowRight, Calendar, Users, Clock, Star } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/ui/navbar"
import { RetroGrid } from "@/components/ui/retro-grid";

export default function HomePage() {
  return (
    <>
      <div className="fixed inset-0 ">
        <RetroGrid />
      </div>

      <div className="min-h-screen relative z-10">
    
        <div className="pt-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
              {/* <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-2xl mb-12">
               
                
              </Card> */}
              <section className="relative bg-gradient-to-br from-pink-d100b9/10 via-pink-a30090/5 to-pink-ff2ee7/10 px-8 py-16 lg:py-24 overflow-hidden  mb-12">
                  <div className="text-center max-w-4xl mx-auto">
                    <Badge
                      variant="secondary"
                      className="mb-6 text-sm font-medium bg-[#FFE6FC] text-[#FF00E1] border-[#FF00E1]/80"
                    >
                      AI-Powered Booking Management
                    </Badge>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance mb-6 text-gray-900">
                      Revolutionize Your Bookings with AI
                    </h1>
                    <p className="text-xl sm:text-2xl text-gray-600 text-pretty mb-8 max-w-3xl mx-auto">
                      Let AI handle your phone calls and WhatsApp messages while you focus on serving customers. Perfect
                      for restaurants, salons, hotels, and small businesses.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        size="lg"
                        className="text-lg px-8 py-3  bg-[#FF00E0] hover:bg-[#FFE6FC] hover:text-[#FF00E0]  text-white hover:border hover:border-[#FF00E0] border-0 rounded-full transition-all duration-300 font-medium"
                      >
                        Start Free Trial
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="text-lg px-8 py-3 border-pink-d100b9/50 text-pink-d100b9 hover:bg-pink-d100b9 hover:text-white hover:border-pink-d100b9 bg-white/80 backdrop-blur-sm rounded-full transition-all duration-300"
                      >
                        Book a Demo
                      </Button>
                    </div>
                  </div>
                </section>
              <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl overflow-hidden mb-12">
                {/* Features Section */}
                <section id="features" className="px-8 py-16">
                  <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                      Everything You Need to Manage Bookings
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      Our AI-powered platform handles every aspect of booking management, so you can focus on what matters
                      most.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <Card className="text-center hover:shadow-lg transition-shadow bg-white/50 backdrop-blur-sm border-pink-d100b9/10">
                      <CardHeader>
                        <div className="mx-auto w-12 h-12 bg-pink-d100b9/10 rounded-lg flex items-center justify-center mb-4">
                          <Phone className="h-6 w-6 text-pink-d100b9" />
                        </div>
                        <CardTitle className="text-xl text-gray-900">AI Phone Agent</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base text-gray-600">
                          AI answers calls 24/7, takes bookings, and handles customer inquiries with natural conversation.
                        </CardDescription>
                      </CardContent>
                    </Card>

                    <Card className="text-center hover:shadow-lg transition-shadow bg-white/50 backdrop-blur-sm border-pink-d100b9/10">
                      <CardHeader>
                        <div className="mx-auto w-12 h-12 bg-pink-ff5cec/10 rounded-lg flex items-center justify-center mb-4">
                          <MessageSquare className="h-6 w-6 text-pink-ff5cec" />
                        </div>
                        <CardTitle className="text-xl text-gray-900">WhatsApp Integration</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base text-gray-600">
                          Customers can book, modify, and cancel bookings directly through WhatsApp messaging.
                        </CardDescription>
                      </CardContent>
                    </Card>

                    <Card className="text-center hover:shadow-lg transition-shadow bg-white/50 backdrop-blur-sm border-pink-d100b9/10">
                      <CardHeader>
                        <div className="mx-auto w-12 h-12 bg-pink-d100b9/10 rounded-lg flex items-center justify-center mb-4">
                          <BarChart3 className="h-6 w-6 text-pink-d100b9" />
                        </div>
                        <CardTitle className="text-xl text-gray-900">Real-time Dashboard</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base text-gray-600">
                          Monitor occupancy rates, table status, and booking trends with live analytics and insights.
                        </CardDescription>
                      </CardContent>
                    </Card>

                    <Card className="text-center hover:shadow-lg transition-shadow bg-white/50 backdrop-blur-sm border-pink-d100b9/10">
                      <CardHeader>
                        <div className="mx-auto w-12 h-12 bg-pink-ff5cec/10 rounded-lg flex items-center justify-center mb-4">
                          <Bell className="h-6 w-6 text-pink-ff5cec" />
                        </div>
                        <CardTitle className="text-xl text-gray-900">Smart Notifications</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base text-gray-600">
                          Automated confirmations, reminders, and follow-ups keep customers informed and reduce no-shows.
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </div>
                </section>  
              </Card>
              
              <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl overflow-hidden mb-12">
                {/* Demo Section */}
                <section id="demo" className="px-8 py-16 bg-gray-50/50">
                  <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                    <div>
                      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">See Your Dashboard in Action</h2>
                      <p className="text-xl text-gray-600 mb-8">
                        Get a complete view of your business with real-time occupancy tracking, booking management, and
                        customer insights all in one place.
                      </p>

                      <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-pink-d100b9 rounded-full"></div>
                          <span className="text-gray-900">Live table status and availability</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-pink-ff5cec rounded-full"></div>
                          <span className="text-gray-900">Customer preferences and history</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-pink-d100b9 rounded-full"></div>
                          <span className="text-gray-900">Revenue and performance analytics</span>
                        </div>
                      </div>

                      <Button
                        size="lg"
                        className="bg-[#FF00E0] hover:bg-[#FFE6FC] hover:text-[#FF00E0]  text-white hover:border hover:border-[#FF00E0] border-0rounded-full shadow-lg hover:shadow-pink-d100b9/30 transition-all duration-300 font-medium"
                      >
                        Schedule a Demo
                        <Calendar className="ml-2 h-5 w-5" />
                      </Button>
                    </div>

                    <div className="mt-12 lg:mt-0">
                      <div className="relative">
                        <div className="bg-card border rounded-lg p-6 shadow-xl">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold">Today's Overview</h3>
                            <Badge variant="secondary">Live</Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                              <div className="text-2xl font-bold text-pink-d100b9">85%</div>
                              <div className="text-sm text-muted-foreground">Occupancy</div>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                              <div className="text-2xl font-bold text-pink-ff5cec">24</div>
                              <div className="text-sm text-muted-foreground">Bookings</div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                              <div className="flex items-center gap-3">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Table 5 - Johnson Party</span>
                              </div>
                              <Badge variant="outline">Seated</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                              <div className="flex items-center gap-3">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Table 2 - Smith Booking</span>
                              </div>
                              <Badge variant="secondary">7:30 PM</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>  
              </Card>
              
              <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl overflow-hidden mb-12">
                {/* Pricing Section */}
                <section id="pricing" className="px-8 py-16">
                  <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
                    <p className="text-xl text-gray-600">Choose the plan that fits your business size and needs</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Starter Plan */}
                    <Card className="relative bg-white/50 backdrop-blur-sm border-pink-d100b9/10">
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl text-gray-900">Starter</CardTitle>
                        <CardDescription className="text-gray-600">Perfect for small businesses</CardDescription>
                        <div className="mt-4">
                          <span className="text-4xl font-bold">$49</span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-pink-d100b9" />
                          <span className="text-sm text-gray-600">Up to 100 bookings/month</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-pink-d100b9" />
                          <span className="text-sm text-gray-600">AI phone agent</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-pink-d100b9" />
                          <span className="text-sm text-gray-600">WhatsApp integration</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-pink-d100b9" />
                          <span className="text-sm text-gray-600">Basic dashboard</span>
                        </div>
                        <Button className="w-full mt-6 bg-transparent" variant="outline">
                          Start Free Trial
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Pro Plan */}
                    <Card className="relative border-pink-d100b9 shadow-lg bg-white/50 backdrop-blur-sm border-pink-d100b9/10">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-pink-d100b9 text-white">Most Popular</Badge>
                      </div>
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl text-gray-900">Pro</CardTitle>
                        <CardDescription className="text-gray-600">For growing restaurants & salons</CardDescription>
                        <div className="mt-4">
                          <span className="text-4xl font-bold">$99</span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-pink-d100b9" />
                          <span className="text-sm text-gray-600">Up to 500 bookings/month</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-pink-d100b9" />
                          <span className="text-sm text-gray-600">Advanced AI features</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-pink-d100b9" />
                          <span className="text-sm text-gray-600">Full dashboard & analytics</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-pink-d100b9" />
                          <span className="text-sm text-gray-600">Customer preferences tracking</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-pink-d100b9" />
                          <span className="text-sm text-gray-600">Priority support</span>
                        </div>
                        <Button className="w-full mt-6 bg-[#FF00E0] hover:bg-[#FFE6FC] hover:text-[#FF00E0]  text-white hover:border hover:border-[#FF00E0] border-0 rounded-full shadow-lg hover:shadow-pink-d100b9/30 transition-all duration-300 font-medium">
                          Start Free Trial
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Business Plan */}
                    <Card className="relative bg-white/50 backdrop-blur-sm border-pink-d100b9/10">
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl text-gray-900">Business</CardTitle>
                        <CardDescription className="text-gray-600">For multi-location businesses</CardDescription>
                        <div className="mt-4">
                          <span className="text-4xl font-bold">$199</span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-pink-d100b9" />
                          <span className="text-sm text-gray-600">Unlimited bookings</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-pink-d100b9" />
                          <span className="text-sm text-gray-600">Multi-location management</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-pink-d100b9" />
                          <span className="text-sm text-gray-600">Custom AI training</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-pink-d100b9" />
                          <span className="text-sm text-gray-600">Advanced reporting</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-pink-d100b9" />
                          <span className="text-sm text-gray-600">Dedicated account manager</span>
                        </div>
                        <Button className="w-full mt-6 bg-transparent" variant="outline">
                          Contact Sales
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </section>
              </Card>
              <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl overflow-hidden mb-12">
                {/* CTA Section */}
              <section className="px-8 py-16 bg-gradient-to-r from-pink-d100b9/10 to-pink-ff2ee7/10 rounded-b-3xl">
                <div className="max-w-4xl mx-auto text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">
                    Ready to Transform Your Booking Management?
                  </h2>
                  <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Join hundreds of businesses already using AI to streamline their bookings and improve customer
                    experience.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <Button
                      size="lg"
                      className="text-lg px-8 py-3 bg-[#FF00E0] hover:bg-[#FFE6FC] hover:text-[#FF00E0]  text-white hover:border hover:border-[#FF00E0] border-0 rounded-full shadow-lg hover:shadow-pink-d100b9/30 transition-all duration-300 font-medium"
                    >
                      Start Your Free Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-lg px-8 py-3 bg-[#FF00E0] hover:bg-[#FFE6FC] hover:text-[#FF00E0]  text-white hover:border hover:border-[#FF00E0] border-0 backdrop-blur-sm rounded-full transition-all duration-300"
                    >
                      Schedule a Demo
                    </Button>
                  </div>

                  <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-current text-pink-d100b9" />
                      <span>No setup fees</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-current text-pink-d100b9" />
                      <span>14-day free trial</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-current text-pink-d100b9" />
                      <span>Cancel anytime</span>
                    </div>
                  </div>
                </div>
              </section>
                </Card>
              
            
          </div>
        </div>

        {/* Footer outside the main card */}
        <footer className="relative z-10 py-12 mt-8">
          <div className="max-w-6xl mx-auto px-8">
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg rounded-2xl p-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-lg font-semibold text-pink-d100b9">Mundi-ai</h3>
                  <p className="text-gray-600">AI-powered booking management</p>
                </div>
                <div className="flex gap-4">
                  <Link href="/sign-in">
                    <Button
                      variant="outline"
                      className="border-pink-d100b9/50 text-pink-d100b9 hover:bg-pink-d100b9 hover:text-white hover:border-pink-d100b9 rounded-full bg-white/80 backdrop-blur-sm transition-all duration-300"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button className="bg-[#FF00E0] hover:bg-[#FFE6FC] hover:text-[#FF00E0]  text-white hover:border hover:border-[#FF00E0] border-0 rounded-full shadow-lg font-medium">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </footer>
      </div>
    </>
  )
}
