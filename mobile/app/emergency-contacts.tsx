import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColor } from "@/hooks/use-theme-color";

type Contact = {
  id: string;
  name: string;
  phone: string;
  primary: boolean;
};

export default function EmergencyContacts() {
  const insets = useSafeAreaInsets();

  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "1",
      name: "Emergency Contact",
      phone: "+91 98765 43210",
      primary: true,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // ================= THEME =================

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  const secondaryTextColor = useThemeColor({}, "textSecondary");
  const mutedTextColor = useThemeColor({}, "textMuted");
  const cyanColor = useThemeColor({}, "cyan");
  const greenColor = useThemeColor({}, "green");
  const redColor = useThemeColor({}, "red");
  const purpleColor = useThemeColor({}, "tint");

  const isDark = backgroundColor === "#0A0F1A";

  // ================= ADD / EDIT =================

  const openAddForm = () => {
    setEditingContact(null);
    setName("");
    setPhone("");
    setShowForm(true);
  };

  const openEditForm = (contact: Contact) => {
    setShowOptions(false);

    setEditingContact(contact);
    setName(contact.name);
    setPhone(contact.phone);

    setShowForm(true);
  };

  const saveContact = () => {
    if (!name.trim() || !phone.trim()) {
      return;
    }

    if (editingContact) {
      setContacts((current) =>
        current.map((contact) =>
          contact.id === editingContact.id
            ? {
                ...contact,
                name: name.trim(),
                phone: phone.trim(),
              }
            : contact,
        ),
      );
    } else {
      const newContact: Contact = {
        id: Date.now().toString(),
        name: name.trim(),
        phone: phone.trim(),
        primary: contacts.length === 0,
      };

      setContacts((current) => [...current, newContact]);
    }

    setName("");
    setPhone("");
    setEditingContact(null);
    setShowForm(false);
  };

  const closeForm = () => {
    setName("");
    setPhone("");
    setEditingContact(null);
    setShowForm(false);
  };

  // ================= OPTIONS =================

  const openOptions = (contact: Contact) => {
    setSelectedContact(contact);
    setShowOptions(true);
  };

  const closeOptions = () => {
    setShowOptions(false);
    setSelectedContact(null);
  };

  // ================= PRIMARY =================

  const setPrimary = (id: string) => {
    setContacts((current) =>
      current.map((contact) => ({
        ...contact,
        primary: contact.id === id,
      })),
    );

    closeOptions();
  };

  // ================= DELETE =================

  const deleteContact = (id: string) => {
    setContacts((current) => {
      const remaining = current.filter((contact) => contact.id !== id);

      if (
        remaining.length > 0 &&
        !remaining.some((contact) => contact.primary)
      ) {
        remaining[0].primary = true;
      }

      return remaining;
    });

    closeOptions();
  };

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor,
        },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* ================= HEADER ================= */}

      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 10,
            height: insets.top + 78,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              backgroundColor: cardColor,
              borderColor,
            },
          ]}
          activeOpacity={0.75}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={textColor} />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            {
              color: textColor,
            },
          ]}
        >
          Emergency Contacts
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* ================= CONTENT ================= */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: 40 + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= INTRO ================= */}

        <View
          style={[
            styles.introCard,
            {
              backgroundColor: "rgba(0, 255, 157, 0.05)",
              borderColor: "rgba(0, 255, 157, 0.16)",
            },
          ]}
        >
          <View
            style={[
              styles.introIcon,
              {
                backgroundColor: "rgba(0, 255, 157, 0.09)",
              },
            ]}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={23}
              color={greenColor}
            />
          </View>

          <View style={styles.introText}>
            <Text
              style={[
                styles.introTitle,
                {
                  color: textColor,
                },
              ]}
            >
              SOS contacts
            </Text>

            <Text
              style={[
                styles.introDescription,
                {
                  color: secondaryTextColor,
                },
              ]}
            >
              These contacts can be notified when MotoSense detects a serious
              emergency.
            </Text>
          </View>
        </View>

        {/* ================= CONTACTS ================= */}

        <Text
          style={[
            styles.sectionLabel,
            {
              color: mutedTextColor,
            },
          ]}
        >
          YOUR CONTACTS
        </Text>

        {contacts.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: cardColor,
                borderColor,
              },
            ]}
          >
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor: "rgba(0, 229, 255, 0.09)",
                },
              ]}
            >
              <Ionicons name="people-outline" size={27} color={cyanColor} />
            </View>

            <Text
              style={[
                styles.emptyTitle,
                {
                  color: textColor,
                },
              ]}
            >
              No emergency contacts
            </Text>

            <Text
              style={[
                styles.emptyDescription,
                {
                  color: secondaryTextColor,
                },
              ]}
            >
              Add someone you trust to receive emergency notifications.
            </Text>
          </View>
        ) : (
          contacts.map((contact) => (
            <View
              key={contact.id}
              style={[
                styles.contactCard,
                {
                  backgroundColor: cardColor,
                  borderColor: contact.primary ? purpleColor : borderColor,
                },
                contact.primary && styles.primaryContactCard,
              ]}
            >
              <View
                style={[
                  styles.contactIcon,
                  {
                    backgroundColor: "rgba(0, 229, 255, 0.09)",
                  },
                ]}
              >
                <Ionicons name="person-outline" size={21} color={cyanColor} />
              </View>

              <View style={styles.contactInfo}>
                <View style={styles.contactNameRow}>
                  <Text
                    style={[
                      styles.contactName,
                      {
                        color: textColor,
                      },
                    ]}
                  >
                    {contact.name}
                  </Text>

                  {contact.primary && (
                    <View
                      style={[
                        styles.primaryBadge,
                        {
                          backgroundColor: "rgba(124, 58, 237, 0.11)",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.primaryBadgeText,
                          {
                            color: purpleColor,
                          },
                        ]}
                      >
                        PRIMARY
                      </Text>
                    </View>
                  )}
                </View>

                <Text
                  style={[
                    styles.contactPhone,
                    {
                      color: secondaryTextColor,
                    },
                  ]}
                >
                  {contact.phone}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.moreButton}
                activeOpacity={0.7}
                onPress={() => openOptions(contact)}
              >
                <Ionicons
                  name="ellipsis-vertical"
                  size={20}
                  color={mutedTextColor}
                />
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* ================= ADD CONTACT ================= */}

        <TouchableOpacity
          style={[
            styles.addButton,
            {
              borderColor: purpleColor,
            },
          ]}
          activeOpacity={0.8}
          onPress={openAddForm}
        >
          <Ionicons name="add" size={20} color={purpleColor} />

          <Text
            style={[
              styles.addButtonText,
              {
                color: purpleColor,
              },
            ]}
          >
            Add Emergency Contact
          </Text>
        </TouchableOpacity>

        {/* ================= SOS NOTE ================= */}

        <View
          style={[
            styles.noteCard,
            {
              backgroundColor: "rgba(255, 184, 0, 0.05)",
              borderColor: "rgba(255, 184, 0, 0.16)",
            },
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#FFB800"
          />

          <Text
            style={[
              styles.noteText,
              {
                color: secondaryTextColor,
              },
            ]}
          >
            Your primary contact will be the first person notified during an SOS
            event.
          </Text>
        </View>
      </ScrollView>

      {/* ===================================================== */}
      {/* ADD / EDIT CONTACT SHEET */}
      {/* ===================================================== */}

      <Modal
        visible={showForm}
        transparent
        animationType="slide"
        onRequestClose={closeForm}
      >
        <View style={styles.modalContainer}>
          <Pressable style={styles.modalBackdrop} onPress={closeForm} />

          <View
            style={[
              styles.bottomSheet,
              {
                backgroundColor: cardColor,
                borderColor,
                paddingBottom: Math.max(insets.bottom + 18, 24),
              },
            ]}
          >
            <View style={styles.sheetHandle} />

            <Text
              style={[
                styles.sheetTitle,
                {
                  color: textColor,
                },
              ]}
            >
              {editingContact ? "Edit Contact" : "Add Emergency Contact"}
            </Text>

            <Text
              style={[
                styles.sheetSubtitle,
                {
                  color: secondaryTextColor,
                },
              ]}
            >
              {editingContact
                ? "Update your emergency contact details."
                : "Add someone you trust for SOS alerts."}
            </Text>

            <Text
              style={[
                styles.inputLabel,
                {
                  color: mutedTextColor,
                },
              ]}
            >
              NAME
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Contact name"
              placeholderTextColor={mutedTextColor}
              style={[
                styles.input,
                {
                  color: textColor,
                  backgroundColor,
                  borderColor,
                },
              ]}
            />

            <Text
              style={[
                styles.inputLabel,
                {
                  color: mutedTextColor,
                },
              ]}
            >
              PHONE NUMBER
            </Text>

            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+91 XXXXX XXXXX"
              placeholderTextColor={mutedTextColor}
              keyboardType="phone-pad"
              style={[
                styles.input,
                {
                  color: textColor,
                  backgroundColor,
                  borderColor,
                },
              ]}
            />

            <View style={styles.formActions}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  {
                    borderColor,
                  },
                ]}
                activeOpacity={0.8}
                onPress={closeForm}
              >
                <Text
                  style={[
                    styles.cancelText,
                    {
                      color: secondaryTextColor,
                    },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  {
                    backgroundColor: purpleColor,
                  },
                ]}
                activeOpacity={0.8}
                onPress={saveContact}
              >
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />

                <Text style={styles.saveText}>
                  {editingContact ? "Save Changes" : "Add Contact"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===================================================== */}
      {/* CONTACT OPTIONS SHEET */}
      {/* ===================================================== */}

      <Modal
        visible={showOptions}
        transparent
        animationType="slide"
        onRequestClose={closeOptions}
      >
        <View style={styles.modalContainer}>
          <Pressable style={styles.modalBackdrop} onPress={closeOptions} />

          <View
            style={[
              styles.optionsSheet,
              {
                backgroundColor: cardColor,
                borderColor,
                paddingBottom: Math.max(insets.bottom + 16, 22),
              },
            ]}
          >
            <View style={styles.sheetHandle} />

            <View style={styles.optionsHeader}>
              <View
                style={[
                  styles.optionsIcon,
                  {
                    backgroundColor: "rgba(0, 229, 255, 0.09)",
                  },
                ]}
              >
                <Ionicons name="person-outline" size={22} color={cyanColor} />
              </View>

              <View style={styles.optionsHeaderText}>
                <Text
                  style={[
                    styles.optionsTitle,
                    {
                      color: textColor,
                    },
                  ]}
                >
                  {selectedContact?.name}
                </Text>

                <Text
                  style={[
                    styles.optionsPhone,
                    {
                      color: secondaryTextColor,
                    },
                  ]}
                >
                  {selectedContact?.phone}
                </Text>
              </View>
            </View>

            {/* EDIT */}

            <TouchableOpacity
              style={styles.optionRow}
              activeOpacity={0.75}
              onPress={() => {
                if (selectedContact) {
                  openEditForm(selectedContact);
                }
              }}
            >
              <View
                style={[
                  styles.optionIcon,
                  {
                    backgroundColor: "rgba(124, 58, 237, 0.10)",
                  },
                ]}
              >
                <Ionicons name="create-outline" size={21} color={purpleColor} />
              </View>

              <View style={styles.optionText}>
                <Text
                  style={[
                    styles.optionTitle,
                    {
                      color: textColor,
                    },
                  ]}
                >
                  Edit Contact
                </Text>

                <Text
                  style={[
                    styles.optionSubtitle,
                    {
                      color: secondaryTextColor,
                    },
                  ]}
                >
                  Update name or phone number
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={19}
                color={mutedTextColor}
              />
            </TouchableOpacity>

            {/* PRIMARY */}

            <TouchableOpacity
              style={styles.optionRow}
              activeOpacity={0.75}
              disabled={selectedContact?.primary}
              onPress={() => {
                if (selectedContact) {
                  setPrimary(selectedContact.id);
                }
              }}
            >
              <View
                style={[
                  styles.optionIcon,
                  {
                    backgroundColor: "rgba(0, 255, 157, 0.08)",
                  },
                ]}
              >
                <Ionicons name="star-outline" size={21} color={greenColor} />
              </View>

              <View style={styles.optionText}>
                <Text
                  style={[
                    styles.optionTitle,
                    {
                      color: textColor,
                    },
                  ]}
                >
                  {selectedContact?.primary
                    ? "Primary Contact"
                    : "Set as Primary"}
                </Text>

                <Text
                  style={[
                    styles.optionSubtitle,
                    {
                      color: secondaryTextColor,
                    },
                  ]}
                >
                  First contact notified during SOS
                </Text>
              </View>

              {selectedContact?.primary ? (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={greenColor}
                />
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color={mutedTextColor}
                />
              )}
            </TouchableOpacity>

            {/* DELETE */}

            <TouchableOpacity
              style={styles.optionRow}
              activeOpacity={0.75}
              onPress={() => {
                if (selectedContact) {
                  deleteContact(selectedContact.id);
                }
              }}
            >
              <View
                style={[
                  styles.optionIcon,
                  {
                    backgroundColor: "rgba(255, 77, 77, 0.09)",
                  },
                ]}
              >
                <Ionicons name="trash-outline" size={21} color={redColor} />
              </View>

              <View style={styles.optionText}>
                <Text
                  style={[
                    styles.optionTitle,
                    {
                      color: redColor,
                    },
                  ]}
                >
                  Remove Contact
                </Text>

                <Text
                  style={[
                    styles.optionSubtitle,
                    {
                      color: secondaryTextColor,
                    },
                  ]}
                >
                  Remove from emergency contacts
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={19}
                color={mutedTextColor}
              />
            </TouchableOpacity>

            {/* CANCEL */}

            <TouchableOpacity
              style={[
                styles.sheetCancelButton,
                {
                  borderColor,
                },
              ]}
              activeOpacity={0.75}
              onPress={closeOptions}
            >
              <Text
                style={[
                  styles.sheetCancelText,
                  {
                    color: secondaryTextColor,
                  },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  /* ================= HEADER ================= */

  header: {
    width: "100%",
    paddingHorizontal: 16,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 44,
    height: 44,

    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  headerSpacer: {
    width: 44,
    height: 44,
  },

  /* ================= CONTENT ================= */

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  /* ================= INTRO ================= */

  introCard: {
    flexDirection: "row",
    alignItems: "center",

    padding: 15,

    borderRadius: 18,
    borderWidth: 1,
  },

  introIcon: {
    width: 45,
    height: 45,

    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  introText: {
    flex: 1,
  },

  introTitle: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 4,
  },

  introDescription: {
    fontSize: 10.5,
    lineHeight: 15,
  },

  /* ================= SECTION ================= */

  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",

    letterSpacing: 1.2,

    marginTop: 24,
    marginBottom: 9,
  },

  /* ================= EMPTY ================= */

  emptyCard: {
    alignItems: "center",

    paddingHorizontal: 25,
    paddingVertical: 28,

    borderRadius: 18,
    borderWidth: 1,
  },

  emptyIcon: {
    width: 55,
    height: 55,

    borderRadius: 17,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 5,
  },

  emptyDescription: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },

  /* ================= CONTACT ================= */

  contactCard: {
    minHeight: 82,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 14,
    paddingVertical: 12,

    marginBottom: 10,

    borderRadius: 18,
    borderWidth: 1,
  },

  primaryContactCard: {
    borderWidth: 1.2,
  },

  contactIcon: {
    width: 45,
    height: 45,

    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  contactInfo: {
    flex: 1,
  },

  contactNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",

    marginBottom: 4,
  },

  contactName: {
    fontSize: 14,
    fontWeight: "800",
    marginRight: 7,
  },

  contactPhone: {
    fontSize: 11,
  },

  primaryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },

  primaryBadgeText: {
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  moreButton: {
    width: 35,
    height: 40,

    alignItems: "center",
    justifyContent: "center",
  },

  /* ================= ADD ================= */

  addButton: {
    height: 50,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: 14,

    borderWidth: 1,
    borderStyle: "dashed",

    marginTop: 4,
  },

  addButtonText: {
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 7,
  },

  /* ================= NOTE ================= */

  noteCard: {
    flexDirection: "row",
    alignItems: "center",

    padding: 14,

    borderRadius: 16,
    borderWidth: 1,

    marginTop: 18,
  },

  noteText: {
    flex: 1,

    fontSize: 10.5,
    lineHeight: 15,

    marginLeft: 10,
  },

  /* ================= MODAL ================= */

  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.68)",
  },

  bottomSheet: {
    paddingHorizontal: 22,
    paddingTop: 10,

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,

    borderWidth: 1,
  },

  optionsSheet: {
    paddingHorizontal: 22,
    paddingTop: 10,

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,

    borderWidth: 1,
  },

  sheetHandle: {
    width: 48,
    height: 5,

    borderRadius: 3,

    backgroundColor: "#596273",

    alignSelf: "center",

    marginBottom: 22,
  },

  /* ================= FORM SHEET ================= */

  sheetTitle: {
    fontSize: 22,
    fontWeight: "800",

    textAlign: "center",
  },

  sheetSubtitle: {
    fontSize: 11.5,
    lineHeight: 17,

    textAlign: "center",

    marginTop: 5,
    marginBottom: 22,
  },

  inputLabel: {
    fontSize: 9,
    fontWeight: "800",

    letterSpacing: 0.8,

    marginBottom: 6,
  },

  input: {
    height: 46,

    borderRadius: 11,
    borderWidth: 1,

    paddingHorizontal: 13,

    fontSize: 12,

    marginBottom: 15,
  },

  formActions: {
    flexDirection: "row",

    gap: 10,

    marginTop: 2,
  },

  cancelButton: {
    flex: 1,

    height: 44,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 11,
    borderWidth: 1,
  },

  cancelText: {
    fontSize: 11,
    fontWeight: "700",
  },

  saveButton: {
    flex: 1,

    height: 44,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: 11,
  },

  saveText: {
    color: "#FFFFFF",

    fontSize: 11,
    fontWeight: "800",

    marginLeft: 5,
  },

  /* ================= OPTIONS SHEET ================= */

  optionsHeader: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 17,
  },

  optionsIcon: {
    width: 48,
    height: 48,

    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  optionsHeaderText: {
    flex: 1,
  },

  optionsTitle: {
    fontSize: 16,
    fontWeight: "800",

    marginBottom: 3,
  },

  optionsPhone: {
    fontSize: 10.5,
  },

  optionRow: {
    minHeight: 67,

    flexDirection: "row",
    alignItems: "center",
  },

  optionIcon: {
    width: 43,
    height: 43,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  optionText: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 13,
    fontWeight: "700",

    marginBottom: 3,
  },

  optionSubtitle: {
    fontSize: 9.5,
    lineHeight: 14,
  },

  sheetCancelButton: {
    height: 45,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 12,
    borderWidth: 1,

    marginTop: 12,
  },

  sheetCancelText: {
    fontSize: 11,
    fontWeight: "800",
  },
});
