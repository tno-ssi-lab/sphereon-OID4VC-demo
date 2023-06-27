import React, {ReactElement, useEffect, useState} from 'react'
import {Text} from "../../components/Text";
import style from '../../components/Text/Text.module.css'
import DeepLink from "../../components/DeepLink";
import {useTranslation} from "react-i18next";
import {AuthorizationResponsePayload} from "@sphereon/did-auth-siop";
import {useNavigate} from "react-router-dom";
import MemoizedAuthenticationQR from '../../components/AuthenticationQR';
import {GenerateAuthRequestURIResponse} from '../../components/AuthenticationQR/auth-model';
import {CreateElementArgs, QRType, URIData} from '@sphereon/ssi-sdk.qr-code-generator';
import {
    getCurrentEcosystemGeneralConfig,
    getCurrentEcosystemPageOrComponentConfig,
    SSICredentialVerifyRequestPageConfig
} from "../../ecosystem-config";
import SSIPrimaryButton from "../../components/SSIPrimaryButton";
import {useMediaQuery} from "react-responsive";
import {NonMobile} from "../../index";
import agent from "../../agent";

export interface QRCodePageProperties {
    setData: React.Dispatch<React.SetStateAction<AuthorizationResponsePayload | undefined>>
}

export default function SSICredentialVerifyRequestPage(): React.ReactElement | null {
    const config = getCurrentEcosystemPageOrComponentConfig('SSICredentialVerifyRequestPage') as SSICredentialVerifyRequestPageConfig
    const {t} = useTranslation()
    const credentialName = getCurrentEcosystemGeneralConfig().credentialName
    const navigate = useNavigate()
    const [deepLink, setDeepLink] = useState<string>('')
    const isTabletOrMobile = useMediaQuery({query: '(max-width: 767px)'})
    const [qr, setQR] = useState<ReactElement>()

    const onSignInComplete = (data: AuthorizationResponsePayload) => {
        const state = {
            data: {
                vp_token: data.vp_token
            }
        };

        navigate('/information/request', {state});
    }

    const createQRCodeElement = (authRequestURIResponse: GenerateAuthRequestURIResponse): CreateElementArgs<QRType.URI, URIData> => {
        const qrProps: CreateElementArgs<QRType.URI, URIData> = {
            data: {
                type: QRType.URI,
                object: authRequestURIResponse.authRequestURI,
                id: authRequestURIResponse.correlationId
            },
            onGenerate: (/*result: ValueResult<QRType.URI, URIData>*/) => {
            },
            renderingProps: {
                bgColor: 'white',
                fgColor: '#000000',
                level: 'L',
                size: 300,
                title: 'Sign in'
            }
        }
        return qrProps
    }

    useEffect(() => {
        if (qr) {
            return
        }
        agent
            .siopClientCreateAuthRequest()
            .then((authRequestURIResponse) => {
                //this.props.setQrCodeData(authRequestURIResponse.authRequestURI)
                agent
                    .qrURIElement(createQRCodeElement(authRequestURIResponse))
                    .then((qrCode) => {
                        setQR(qrCode)
                    })
            }).catch(error => console.log(error))
    }, [qr]);

    return (

        <div style={{display: 'flex', height: '100vh', width: '100%'}}>
            <NonMobile>
                <div style={{
                    display: 'flex',
                    width: '60%',
                    height: '100%',
                    background: `url(${config.photoLeft})`,
                    backgroundSize: 'cover',
                    flexDirection: 'column'
                }}>

                </div>
            </NonMobile>
            <div style={{
                display: 'flex',
                width: `${isTabletOrMobile ? '100%' : '40%'}`,
                height: '100%',
                backgroundColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '70%'
                }}>
                    <Text style={{textAlign: 'center'}}
                          className={style.pReduceLineSpace}
                          title={t('credential_verify_request_right_pane_top_title', {credentialName}).split('\n')}
                          lines={t('credential_verify_request_right_pane_top_paragraph', {credentialName}).split('\n')}/>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '55%',
                        marginBottom: '15%',
                        marginTop: '15%'
                    }}>
                        <div style={{flexGrow: 1, display: 'flex', justifyContent: 'center'}}>
                            {<MemoizedAuthenticationQR onAuthRequestRetrieved={console.log}
                                                       onSignInComplete={onSignInComplete}
                                                       setQrCodeData={setDeepLink}/>}
                        </div>
                        <DeepLink style={{flexGrow: 1}} link={deepLink}/>
                    </div>
                    <Text style={{flexGrow: 1}} className={`${style.pReduceLineSpace} poppins-semi-bold-16`}
                          lines={t('credential_verify_request_right_pane_bottom_paragraph').split('\n')}/>
                    <div style={{
                        width: '20%',
                        alignSelf: 'flex-end'
                    }}>
                        <SSIPrimaryButton
                            caption={t('credential_verify_request_right_pane_button_caption')}
                            style={{width: 200}}
                            onClick={async () => {
                                navigate('/information/request');
                            }}
                        />
                    </div>
                </div>

            </div>
        </div>
    )
}

