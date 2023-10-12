import React, { Component, useState, useRef, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, Button } from 'react-native';
import RNFS from 'react-native-fs';
import * as permissions from 'react-native-permissions';
import AWS from 'aws-sdk';
import { ENV, AWS_DEFAULT_REGION, AWS_ACCESSKEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET } from "@env";

