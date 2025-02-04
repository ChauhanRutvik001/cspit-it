import { useState, useEffect } from "react";
import Select from "react-select";
import BeatLoader from "react-spinners/BeatLoader";
import axiosInstance from "../utils/axiosInstance";
import { useSelector } from "react-redux";
import Header from "./Header";
import toast from "react-hot-toast";

const DomainSelection = () => {
  const [domains, setDomains] = useState([]);
  const [domainSelections, setDomainSelections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const user = useSelector((state) => state.app.user);

  useEffect(() => {
    const fetchDomains = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/studentSelection/domains");
        setDomains(response.data);
        setDataLoaded(true);
      } catch (error) {
        console.error("Error fetching domains:", error);
        toast.error("Failed to fetch domains.");
      } finally {
        setLoading(false);
      }
    };
    fetchDomains();
  }, []);

  useEffect(() => {
    const fetchSelections = async () => {
      if (!user?._id) return;
      try {
        const response = await axiosInstance.get(
          `/studentSelection/selections/${user._id}`
        );
        const existingSelections = response.data?.selections || [];
        if (existingSelections.length > 0) {
          const updatedSelections = existingSelections.map((selection) => {
            const subdomainOptions = fetchSubdomains(selection.domain);
            const topicOptions = fetchTopics(selection.subdomains);
            return {
              selectedDomain: selection.domain,
              selectedSubdomains: selection.subdomains.map(
                (subdomain) => subdomain.subdomain
              ),
              selectedTopics: selection.subdomains.reduce((acc, subdomain) => {
                acc[subdomain.subdomain] = subdomain.topics;
                return acc;
              }, {}),
              subdomainOptions: subdomainOptions,
              topicOptions: topicOptions,
            };
          });
          setDomainSelections(updatedSelections);
        } else {
          setDomainSelections([
            {
              selectedDomain: null,
              selectedSubdomains: [],
              selectedTopics: {},
              subdomainOptions: [],
              topicOptions: {},
            },
          ]);
        }
      } catch (error) {
        // setDataLoaded(true);
        setDomainSelections([
          {
            selectedDomain: null,
            selectedSubdomains: [],
            selectedTopics: {},
            subdomainOptions: [],
            topicOptions: {},
          },
        ]);
        console.error("Error fetching selections:", error);
      }
    };

    fetchSelections();
  }, [user]);

  const fetchSubdomains = (selectedDomain) => {
    const subdomains =
      domains.find((domain) => domain.domain === selectedDomain)?.subdomains ||
      [];
    return subdomains;
  };

  const fetchTopics = (subdomains) => {
    let topicOptions = {};
    subdomains.forEach((subdomain) => {
      topicOptions[subdomain.subdomain] = subdomain.topics;
    });
    return topicOptions;
  };

  const saveSelections = async () => {
    // Ensure at least one domain is selected
    if (domainSelections.length === 0) {
      toast.error("Please select at least one domain.");
      return;
    }

    // Validate subdomains and topics for each domain
    const allSelectionsValid = domainSelections.every(
      (selection) =>
        selection.selectedSubdomains.length > 0 && // At least one subdomain
        selection.selectedSubdomains.every(
          (subdomain) =>
            selection.selectedTopics[subdomain] &&
            selection.selectedTopics[subdomain].length > 0 // At least one topic for each subdomain
        )
    );

    if (!allSelectionsValid) {
      toast.error(
        "Each selected domain must have at least one subdomain and one topic."
      );
      return;
    }

    try {
      setLoading(true);
      const selectionsToSave = domainSelections.map((selection) => ({
        domain: selection.selectedDomain,
        subdomains: selection.selectedSubdomains.map((subdomain) => ({
          subdomain,
          topics: selection.selectedTopics[subdomain],
        })),
      }));

      await axiosInstance.post("/studentSelection/selections", {
        studentId: user?._id,
        selections: selectionsToSave,
      });

      toast.success("Selections saved successfully!");
    } catch (error) {
      console.error("Error saving selections:", error);
      toast.error("Failed to save selections.");
    } finally {
      setLoading(false);
    }
  };

  const addMoreDomains = () => {
    setDomainSelections((prevSelections) => [
      ...prevSelections,
      {
        selectedDomain: null,
        selectedSubdomains: [],
        selectedTopics: {},
        subdomainOptions: [],
        topicOptions: [],
      },
    ]);
  };

  const removeDomainBox = (index) => {
    const updatedSelections = [...domainSelections];
    updatedSelections.splice(index, 1);
    setDomainSelections(updatedSelections);
  };

  const handleDomainChange = (index, selectedDomain) => {
    const subdomainOptions = fetchSubdomains(selectedDomain);
    const updatedSelections = [...domainSelections];
    updatedSelections[index].selectedDomain = selectedDomain;
    updatedSelections[index].subdomainOptions = subdomainOptions;
    updatedSelections[index].selectedSubdomains = [];
    updatedSelections[index].selectedTopics = {};
    setDomainSelections(updatedSelections);
  };

  const handleSubdomainChange = (index, selectedSubdomains) => {
    const topicOptions = selectedSubdomains.reduce((acc, subdomain) => {
      const subdomainData = domainSelections[index].subdomainOptions.find(
        (sub) => sub.subdomain === subdomain
      );
      if (subdomainData) {
        acc[subdomain] = subdomainData.topics || [];
      }
      return acc;
    }, {});
    const updatedSelections = [...domainSelections];
    updatedSelections[index].selectedSubdomains = selectedSubdomains;
    updatedSelections[index].selectedTopics = topicOptions;
    setDomainSelections(updatedSelections);
  };

  const handleTopicChange = (index, subdomain, selectedTopics) => {
    const updatedSelections = [...domainSelections];
    updatedSelections[index].selectedTopics[subdomain] = selectedTopics.map(
      (item) => item.value
    );
    setDomainSelections(updatedSelections);
  };

  const getAvailableDomains = (index) => {
    const selectedDomains = domainSelections
      .slice(0, index)
      .map((selection) => selection.selectedDomain);
    return domains.filter((domain) => !selectedDomains.includes(domain.domain));
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        <div className="p-6 pt-20">
          <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
            Domain Selection
          </h1>

          {loading && !dataLoaded && (
            <div className="flex justify-center items-center h-screen">
              <BeatLoader color="#4CAF50" size={15} />
            </div>
          )}

          {dataLoaded && domains.length === 0 && (
            <div className="text-center text-gray-500">
              <p>No domains found. Please contact the administrator.</p>
            </div>
          )}

          {dataLoaded && domains.length > 0 && (
            <div className="mt-6 space-y-6">
              {domainSelections.map((selection, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700">
                      Select Domain #{index + 1}
                    </h2>
                    {domainSelections.length > 1 && (
                      <button
                        className="text-red-600 hover:text-red-700 font-semibold"
                        onClick={() => removeDomainBox(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <Select
                    options={getAvailableDomains(index).map((domain) => ({
                      value: domain.domain,
                      label: domain.domain,
                    }))}
                    value={
                      selection.selectedDomain
                        ? {
                            value: selection.selectedDomain,
                            label: selection.selectedDomain,
                          }
                        : null
                    }
                    onChange={(selected) =>
                      handleDomainChange(index, selected?.value)
                    }
                    placeholder="Select a domain"
                    className="basic-multi-select mb-4"
                    classNamePrefix="select"
                    isClearable={true}
                  />

                  {selection.selectedDomain &&
                    selection.subdomainOptions.length > 0 && (
                      <div className="mt-6">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">
                          Select Subdomain(s) for Domain
                        </h2>
                        <Select
                          isMulti
                          options={selection.subdomainOptions.map(
                            (subdomain) => ({
                              value: subdomain.subdomain,
                              label: subdomain.subdomain,
                            })
                          )}
                          value={selection.selectedSubdomains.map(
                            (subdomain) => ({
                              value: subdomain,
                              label: subdomain,
                            })
                          )}
                          onChange={(selected) =>
                            handleSubdomainChange(
                              index,
                              selected.map((item) => item.value)
                            )
                          }
                          placeholder="Select subdomains"
                          className="basic-multi-select mb-4"
                          classNamePrefix="select"
                          isClearable={true}
                        />
                      </div>
                    )}

                  {selection.selectedSubdomains.length > 0 && (
                    <div className="mt-6">
                      <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Select Topics for Domain
                      </h2>
                      {selection.selectedSubdomains.map((subdomain) => (
                        <div key={subdomain} className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-600">
                            {subdomain}
                          </h3>
                          <Select
                            isMulti
                            options={selection.topicOptions[subdomain]?.map(
                              (topic) => ({
                                value: topic,
                                label: topic,
                              })
                            )}
                            value={selection.selectedTopics[subdomain]?.map(
                              (topic) => ({
                                value: topic,
                                label: topic,
                              })
                            )}
                            onChange={(selected) =>
                              handleTopicChange(index, subdomain, selected)
                            }
                            placeholder="Select topics"
                            className="basic-multi-select"
                            classNamePrefix="select"
                            isClearable={true}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="text-center">
                <button
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={addMoreDomains}
                >
                  Add More Domains
                </button>
              </div>

              <div className="mt-6 text-center">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  onClick={saveSelections}
                >
                  {loading ? "Saving..." : "Save Selections"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DomainSelection;
