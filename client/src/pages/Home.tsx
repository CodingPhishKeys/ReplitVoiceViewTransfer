import { Sidebar } from "@/components/Sidebar";
import { useSites } from "@/hooks/use-voiceview";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Map, Server, Activity, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const { data: sites, isLoading } = useSites();
  const [search, setSearch] = useState("");

  const filteredSites = sites?.filter(site => 
    site.name.toLowerCase().includes(search.toLowerCase()) || 
    site.region.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          
          <div className="space-y-4">
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
            <p className="text-muted-foreground text-lg max-w-3xl">
              Welcome to VoiceView. Access detailed infrastructure information, connectivity diagrams, and telephony services for all managed locations.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-none text-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 font-medium">Total Sites</p>
                    <h2 className="text-4xl font-bold mt-2">{sites?.length || 0}</h2>
                  </div>
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Map className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800 shadow-sm border-l-4 border-l-emerald-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground font-medium">Active Services</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <h2 className="text-4xl font-bold text-foreground">98%</h2>
                      <span className="text-sm text-emerald-600 font-medium">+2%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <Activity className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800 shadow-sm border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground font-medium">Systems</p>
                    <h2 className="text-4xl font-bold mt-2 text-foreground">12</h2>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Server className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Section */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search sites by name or region..." 
                className="pl-10 h-12 text-lg bg-white shadow-sm border-slate-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {isLoading ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">Loading sites...</div>
              ) : filteredSites.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">No sites found matching your search.</div>
              ) : (
                filteredSites.map(site => (
                  <Link key={site.id} href={`/sites/${site.id}`} className="group block">
                    <Card className="h-full hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-blue-300 group-hover:-translate-y-1">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                            {site.code || site.name.substring(0,2).toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded-full text-slate-600">
                            {site.region}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 transition-colors">{site.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {site.description || "No description provided."}
                        </p>
                        <div className="mt-4 flex items-center text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
