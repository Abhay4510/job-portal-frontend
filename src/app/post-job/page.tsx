'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, BriefcaseIcon } from 'lucide-react';

interface GeoNamesResponse {
  geonames: Array<{
    name: string;
  }>;
}

interface CountryItem {
  name: string;
  code: string; 
}

interface CountryData {
  name: {
    common: string;
  };
  cca2: string;
}

interface JobFormData {
  title: string;
  description: string;
  location: string;
  requirements: string;
  type: string;
  experience: {
    min: string;
    max: string;
  };
  salary: string;
  country: string;
  state: string;
  city: string;
}

const initialFormData: JobFormData = {
  title: '',
  description: '',
  location: '',
  requirements: '',
  type: '',
  experience: {
    min: '',
    max: '',
  },
  salary: '',
  country: '',
  state: '',
  city: '',
};

export default function PostJobPage() {
  const [formData, setFormData] = useState<JobFormData>(initialFormData);

  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [isCountriesLoading, setIsCountriesLoading] = useState(false);
  const [isStatesLoading, setIsStatesLoading] = useState(false);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [countrySearch, setCountrySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  const { token } = useAuth();
  const router = useRouter();
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsCountriesLoading(true);
        setFetchError(null);
        const res = await fetch('https://restcountries.com/v3.1/all');
        if (!res.ok) {
          throw new Error(`Countries fetch failed: ${res.statusText}`);
        }
        const data = await res.json();
        const countryList: CountryItem[] = data
          .filter((c: CountryData) => c.cca2) 
          .map((c: CountryData) => ({
            name: c.name.common,
            code: c.cca2, 
          }))
          .sort((a: CountryItem, b: CountryItem) => a.name.localeCompare(b.name));

        setCountries(countryList);
      } catch (error: unknown) {
        console.error('Error fetching countries:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error fetching countries.';
        setFetchError(errorMessage);
      } finally {
        setIsCountriesLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const handleCountryChange = async (value: string) => {
    setFormData((prev) => ({ ...prev, country: value, state: '', city: '' }));
    setStates([]);
    setCities([]);
    setFetchError(null);

    if (!value) return;

    try {
      setIsStatesLoading(true);
      const res = await fetch(
        `http://api.geonames.org/searchJSON?country=${value}&featureClass=A&featureCode=ADM1&username=abhay4510`
      );
      if (!res.ok) {
        throw new Error(`States fetch failed: ${res.statusText}`);
      }
      const data = (await res.json()) as GeoNamesResponse;
      const stateNames = data.geonames?.map((g) => g.name) ?? [];
      const uniqueStates = Array.from(new Set(stateNames)).sort();
      setStates(uniqueStates);
    } catch (error: unknown) {
      console.error('Error fetching states:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error fetching states.';
      setFetchError(errorMessage);
    } finally {
      setIsStatesLoading(false);
    }
  };
  const handleStateChange = async (value: string) => {
    setFormData((prev) => ({ ...prev, state: value, city: '' }));
    setCities([]);
    setFetchError(null);

    if (!value || !formData.country) return;

    try {
      setIsCitiesLoading(true);
      const res = await fetch(
        `http://api.geonames.org/searchJSON?q=${value}&country=${formData.country}&featureClass=P&username=abhay4510`
      );
      if (!res.ok) {
        throw new Error(`Cities fetch failed: ${res.statusText}`);
      }
      const data = (await res.json()) as GeoNamesResponse;
      const cityNames = data.geonames?.map((g) => g.name) ?? [];
      const uniqueCities = Array.from(new Set(cityNames)).sort();
      setCities(uniqueCities);
    } catch (error: unknown) {
      console.error('Error fetching cities:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error fetching cities.';
      setFetchError(errorMessage);
    } finally {
      setIsCitiesLoading(false);
    }
  };

  const handleCityChange = (value: string) => {
    setFormData((prev) => ({ ...prev, city: value }));
  };

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredStates = states.filter((st) =>
    st.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const filteredCities = cities.filter((ct) =>
    ct.toLowerCase().includes(citySearch.toLowerCase())
  );

  // ------------------ Handle Submit Job ------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitLoading(true);
    setFetchError(null);
    
    try {
      const response = await fetch(
        'https://job-portal-backend-82a8.vercel.app/api/job/jobs',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        router.push('/jobs');
      } else {
        throw new Error(`Job creation failed: ${response.statusText}`);
      }
    } catch (error: unknown) {
      console.error('Error posting job:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error posting job';
      setFetchError(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <Card className="backdrop-blur-sm bg-white bg-opacity-90">
        <CardHeader>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <BriefcaseIcon className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-2xl font-bold">Post a New Job</CardTitle>
          </motion.div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* --- Error Display (if any) --- */}
            {fetchError && (
              <div className="p-2 bg-red-100 text-red-700 rounded-md">
                {fetchError}
              </div>
            )}

            {/* Job Title */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium mb-2">Job Title</label>
              <Input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full"
                placeholder="e.g., Senior Frontend Developer"
              />
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full min-h-[150px]"
                placeholder="Describe the role, responsibilities, and qualifications..."
              />
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium mb-2">Location</label>
              <Input
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., Remote, Hybrid, or Office Address"
              />
            </motion.div>

            {/* Requirements */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium mb-2">Requirements</label>
              <Input
                required
                value={formData.requirements}
                onChange={(e) =>
                  setFormData({ ...formData, requirements: e.target.value })
                }
                placeholder="e.g., React, Node.js, TypeScript"
              />
            </motion.div>

            {/* Job Type & Salary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm font-medium mb-2">Job Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white max-h-60 overflow-auto">
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <label className="block text-sm font-medium mb-2">Salary</label>
                <Input
                  required
                  type="number"
                  value={formData.salary}
                  onChange={(e) =>
                    setFormData({ ...formData, salary: e.target.value })
                  }
                  placeholder="Annual salary in USD"
                />
              </motion.div>
            </div>

            {/* Country / State / City */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* ---------- Country ---------- */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <label className="block text-sm font-medium mb-2">Country</label>
                <Select
                  value={formData.country}
                  onValueChange={handleCountryChange}
                >
                  <SelectTrigger disabled={isCountriesLoading}>
                    <SelectValue
                      placeholder={
                        isCountriesLoading
                          ? 'Loading...'
                          : 'Select a country'
                      }
                    />
                  </SelectTrigger>

                  <SelectContent className="bg-white max-h-60 overflow-auto">
                    {isCountriesLoading ? (
                      <div className="p-2 flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading countries...
                      </div>
                    ) : (
                      <>
                        {/* A little search box */}
                        <div className="p-2">
                          <Input
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            placeholder="Type to filter..."
                            className="h-8"
                          />
                        </div>
                        {filteredCountries.length > 0 ? (
                          filteredCountries.map((country) => (
                            <SelectItem
                              key={country.code}
                              value={country.code}
                            >
                              {country.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-gray-500">
                            No matching countries
                          </div>
                        )}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </motion.div>

              {/* ---------- State ---------- */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <label className="block text-sm font-medium mb-2">State</label>
                <Select
                  value={formData.state}
                  onValueChange={handleStateChange}
                  disabled={!formData.country || isStatesLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isStatesLoading
                          ? 'Loading...'
                          : formData.country
                          ? 'Select a state'
                          : 'Select country first'
                      }
                    />
                  </SelectTrigger>

                  <SelectContent className="bg-white max-h-60 overflow-auto">
                    {isStatesLoading ? (
                      <div className="p-2 flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading states...
                      </div>
                    ) : (
                      <>
                        {/* A little search box */}
                        <div className="p-2">
                          <Input
                            value={stateSearch}
                            onChange={(e) => setStateSearch(e.target.value)}
                            placeholder="Type to filter..."
                            className="h-8"
                          />
                        </div>
                        {filteredStates.length > 0 ? (
                          filteredStates.map((st) => (
                            <SelectItem key={st} value={st}>
                              {st}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-gray-500">
                            No matching states
                          </div>
                        )}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </motion.div>

              {/* ---------- City ---------- */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.0 }}
              >
                <label className="block text-sm font-medium mb-2">City</label>
                <Select
                  value={formData.city}
                  onValueChange={handleCityChange}
                  disabled={!formData.state || isCitiesLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isCitiesLoading
                          ? 'Loading...'
                          : formData.state
                          ? 'Select a city'
                          : 'Select state first'
                      }
                    />
                  </SelectTrigger>

                  <SelectContent className="bg-white max-h-60 overflow-auto">
                    {isCitiesLoading ? (
                      <div className="p-2 flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading cities...
                      </div>
                    ) : (
                      <>
                        {/* A little search box */}
                        <div className="p-2">
                          <Input
                            value={citySearch}
                            onChange={(e) => setCitySearch(e.target.value)}
                            placeholder="Type to filter..."
                            className="h-8"
                          />
                        </div>
                        {filteredCities.length > 0 ? (
                          filteredCities.map((ct) => (
                            <SelectItem key={ct} value={ct}>
                              {ct}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-gray-500">
                            No matching cities
                          </div>
                        )}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </motion.div>
            </div>

            {/* Experience (Min, Max) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                <label className="block text-sm font-medium mb-2">
                  Minimum Experience (years)
                </label>
                <Input
                  required
                  type="number"
                  value={formData.experience.min}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      experience: {
                        ...formData.experience,
                        min: e.target.value,
                      },
                    })
                  }
                  placeholder="0"
                />
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <label className="block text-sm font-medium mb-2">
                  Maximum Experience (years)
                </label>
                <Input
                  required
                  type="number"
                  value={formData.experience.max}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      experience: {
                        ...formData.experience,
                        max: e.target.value,
                      },
                    })
                  }
                  placeholder="5"
                />
              </motion.div>
            </div>

            {/* Submit & Cancel Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="flex justify-end gap-4"
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full md:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitLoading}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
              >
                {submitLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Post Job'
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}