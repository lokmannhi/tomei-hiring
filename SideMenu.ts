import { HamburgerIcon } from "@chakra-ui/icons";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Box,
  Center,
  Flex,
  IconButton,
  Image,
  Slide,
  Spacer,
  Stack,
  Text,
  useDisclosure,
  WrapItem,
} from "@chakra-ui/react";
import { FaCog, FaPowerOff, FaClipboardList } from "react-icons/fa";
import { RiComputerLine } from "react-icons/ri";
import { CgProfile } from "react-icons/cg";
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Cookies from "universal-cookie/es6";
import { useStoreActions, useStoreState } from "easy-peasy";
import { removeInterceptor } from "./axiosInterceptor";

const SideMenu = (props) => {
  const [isConfigOpened, setIsConfigOpened] = useState<boolean>(false);
  const userProfile = useStoreState((state: any) => state.userProfile.data);
  const refreshProfile = useStoreActions(
    (actions: any) => actions.userProfile.refreshProfile
  );
  const { isOpen, onToggle } = useDisclosure<{
    defaultIsOpen: boolean;
    onClose: () => void;
    onOpen: () => void;
  }>({
    defaultIsOpen: true,
    onClose: () => {
      props.setMenuClosed(true);
    },
    onOpen: () => {
      props.setMenuClosed(false);
    },
  });

  const sideMenuHighlight = isOpen
    ? {
        fontWeight: "bold",
        color: "#6e26c7",
      }
    : null;

  const location = useLocation();

  React.useEffect(() => {
    if (window.location.pathname.includes("config")) {
      setIsConfigOpened(true);
    } else if (!window.location.pathname.includes("config")) {
      setIsConfigOpened(false);
    }
    refreshProfile();
  }, [location]);

  const highlightBorder = (
    <Box
      border="3px solid #6e26c7"
      borderRadius="25px"
      backgroundColor="#6e26c7"
      mr={1}
    />
  );
  return (
    <Slide
      direction="left"
      style={{
        width: "280px",
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: isOpen ? 0 : 30,
        zIndex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        backgroundColor: "#F6F6F6",
        color: "#8F8F8F",
      }}
      h="inherit"
      id="sideMenu"
      in={isOpen}
    >
      <Box p={5}>
        <Flex>
          <Image
            src={`${window.location.origin}/logo.png`}
            alt="Tomei"
            w="115px"
            ml={6}
          />
          <Spacer />
          <IconButton
            mr={isOpen ? 0 : "-25px"}
            aria-label="Close Menu"
            icon={<HamburgerIcon />}
            color="black"
            bg="#F6F6F6"
            fontSize="20px"
            onClick={onToggle}
          />
        </Flex>
      </Box>

      {isOpen && (
        <>
          <Center pl={5} mb={7} fontWeight="bold" fontSize="xl">
            Single Sign On (SSO) System
          </Center>

          <WrapItem pl={10}>
            <Avatar src={userProfile.image} size="sm" borderRadius={0} />
            <Box as="span" fontSize="md" pl={6} fontWeight="bold">
              {userProfile.name}
              <br />
              <Box fontSize="sm" fontWeight="normal" mt={1}>
                <span>
                  {userProfile.building} / {userProfile.department}
                </span>
              </Box>
            </Box>
          </WrapItem>

          <Stack align="left" direction="column" spacing={5} pl={10}>
            <Box mt={4}>
              <Text fontSize="xl" fontWeight="bold">
                MAIN MENU
              </Text>
            </Box>
            {userProfile.userRoles.indexOf("my profile") && (
              <NavLink
                to="/profile"
                exact={true}
                activeStyle={sideMenuHighlight}
              >
                <Flex>
                  <Box>
                    <CgProfile size={25} style={{ display: "inline" }} />
                    <Text fontSize="lg" style={{ display: "inline" }} ml={3}>
                      My Profile
                    </Text>
                  </Box>
                  <Spacer />
                  {location.pathname === "/profile" ? highlightBorder : null}
                </Flex>
              </NavLink>
            )}
            {userProfile.userRoles.indexOf("my systems") && (
              <>
                <NavLink to="/" exact={true} activeStyle={sideMenuHighlight}>
                  <Flex>
                    <Box>
                      <RiComputerLine size={25} style={{ display: "inline" }} />
                      <Text fontSize="lg" style={{ display: "inline" }} ml={3}>
                        My Systems
                      </Text>
                    </Box>
                    <Spacer />
                    {location.pathname === "/" ? highlightBorder : null}
                  </Flex>
                </NavLink>
              </>
            )}
            {userProfile.userRoles.indexOf("staff directory") && (
              <NavLink to="/directory" activeStyle={sideMenuHighlight}>
                <Flex>
                  <Box>
                    <FaClipboardList size={25} style={{ display: "inline" }} />
                    <Text fontSize="lg" style={{ display: "inline" }} ml={3}>
                      Staff Directory
                    </Text>
                  </Box>
                  <Spacer />
                  {location.pathname === "/directory" ? highlightBorder : null}
                </Flex>
              </NavLink>
            )}
            {userProfile.userRoles.filter((role) => role.includes("management"))
              .length > 0 && (
              <Accordion allowToggle>
                <AccordionItem border="none" mr={"4px"}>
                  <Flex>
                    <AccordionButton
                      p={0}
                      style={
                        isConfigOpened
                          ? {
                              fontWeight: "bold",
                              color: "#6e26c7",
                            }
                          : {
                              fontWeight: "normal",
                              color: "#8F8F8F",
                              borderRight: "0px",
                            }
                      }
                      flex="1"
                    >
                      <Box>
                        <FaCog size={25} style={{ display: "inline" }} />
                        <Text fontSize="lg" d="inline" ml={3}>
                          Settings
                        </Text>
                      </Box>
                      <Spacer />
                      <Box>{isOpen ? <AccordionIcon /> : null}</Box>
                    </AccordionButton>
                    <Box
                      border={
                        location.pathname.includes("config")
                          ? "3px solid #6e26c7"
                          : "3px solid #F6F6F6"
                      }
                      borderRadius="25px"
                      backgroundColor={
                        location.pathname.includes("config")
                          ? "#6e26c7"
                          : "#F6F6F6"
                      }
                    />
                  </Flex>
                  <AccordionPanel>
                    {userProfile.userRoles.indexOf("system management") >=
                      0 && (
                      <NavLink
                        to="/config/system"
                        activeStyle={{ color: "#6e26c7", fontWeight: "bold" }}
                      >
                        <Box mb={3} ml={5}>
                          <Text fontSize="md">System Management</Text>
                        </Box>
                      </NavLink>
                    )}
                    {userProfile.userRoles.indexOf("company management") >=
                      0 && (
                      <NavLink
                        to="/config/company"
                        activeStyle={{ color: "#6e26c7", fontWeight: "bold" }}
                      >
                        <Box mb={3} ml={5}>
                          <Text fontSize="md">Company Management</Text>
                        </Box>
                      </NavLink>
                    )}
                    {userProfile.userRoles.indexOf("building management") >=
                      0 && (
                      <NavLink
                        to="/config/building"
                        activeStyle={{ color: "#6e26c7", fontWeight: "bold" }}
                      >
                        <Box mb={3} ml={5}>
                          <Text fontSize="md">Building Management</Text>
                        </Box>
                      </NavLink>
                    )}
                    {userProfile.userRoles.indexOf("department management") >=
                      0 && (
                      <NavLink
                        to="/config/department"
                        activeStyle={{ color: "#6e26c7", fontWeight: "bold" }}
                      >
                        <Box mb={3} ml={5}>
                          <Text fontSize="md">Department Management</Text>
                        </Box>
                      </NavLink>
                    )}
                    {userProfile.userRoles.indexOf("user management") >= 0 && (
                      <NavLink
                        to="/config/user"
                        activeStyle={{ color: "#6e26c7", fontWeight: "bold" }}
                      >
                        <Box mb={3} ml={5}>
                          <Text fontSize="md">User Management</Text>
                        </Box>
                      </NavLink>
                    )}
                    {userProfile.userRoles.indexOf("role management") >= 0 && (
                      <NavLink
                        to="/config/role"
                        activeStyle={{ color: "#6e26c7", fontWeight: "bold" }}
                      >
                        <Box mb={3} ml={5}>
                          <Text fontSize="md">Role Management</Text>
                        </Box>
                      </NavLink>
                    )}
                    {userProfile.userRoles.indexOf("privilege management") >=
                      0 && (
                      <NavLink
                        to="/config/privilege"
                        activeStyle={{ color: "#6e26c7", fontWeight: "bold" }}
                      >
                        <Box mb={3} ml={5}>
                          <Text fontSize="md">Privilege Management</Text>
                        </Box>
                      </NavLink>
                    )}
                    {userProfile.userRoles.indexOf("user group management") >=
                      0 && (
                      <NavLink
                        to="/config/user-groups"
                        activeStyle={{ color: "#6e26c7", fontWeight: "bold" }}
                      >
                        <Box mb={3} ml={5}>
                          <Text fontSize="md">User Group Management</Text>
                        </Box>
                      </NavLink>
                    )}
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            )}
            <Box mb={10}>
              <NavLink
                to="/login"
                onClick={() => {
                  removeInterceptor();
                  const cookies = new Cookies();
                  cookies.remove("tomei-sso-token", {
                    path: "/",
                  });
                  window.location.reload();
                }}
              >
                <FaPowerOff size={25} style={{ display: "inline" }} />
                <Text fontSize="lg" d="inline" ml={3}>
                  Logout
                </Text>
              </NavLink>
            </Box>
            <Box position="absolute" bottom={10}>
              <Text mb={1} fontWeight="bold">
                TOMEI SSO System
              </Text>
              <Text fontSize="md" fontStyle="Open Sans" fontWeight="light">
                Made by TOMEI ITD
              </Text>
            </Box>
          </Stack>
        </>
      )}
    </Slide>
  );
};

export default SideMenu;
